import fs from 'node:fs';

const source = fs.readFileSync('functions/api/ai-chat.js', 'utf8');
const budget = fs.readFileSync('functions/_lib/ai-global-budget.js', 'utf8');
const fail = (message) => {
  console.error(`chatbot-public-form-boundary: FAIL — ${message}`);
  process.exit(1);
};

const forbidden = [
  '/rest/v1/quote_requests',
  "from('quote_requests')",
  '.from("quote_requests")',
  'SUPABASE_ANON_KEY',
  "Prefer': 'return=minimal'",
];
for (const token of forbidden) {
  if (source.includes(token)) fail(`forbidden direct-write token present: ${token}`);
}

const requiredCalls = [
  { re: /await\s+verifyTurnstile\s*\(/, why: 'Turnstile must be awaited, not hardcoded' },
  { re: /await\s+decideGlobalBudget\s*\(/, why: 'global budget decision must be awaited before upstream AI' },
  { re: /takeCostBudget\s*\(\s*key\s*,\s*MAX_TOKENS\s*\)/, why: 'per-isolate supplemental cost check must still be called' },
  { re: /return json\(origin, 429, \{ code: 'cost_circuit_open'/, why: 'cost_circuit_open must be a live response code, not a comment token' },
  { re: /quote_persisted:\s*false/, why: 'quote must not be persisted by the public AI endpoint' },
];
for (const rule of requiredCalls) {
  if (!rule.re.test(source)) fail(rule.why);
}

const budgetCallAt = source.search(/await\s+decideGlobalBudget\s*\(/);
const anthropicAt = source.indexOf('https://api.anthropic.com');
if (budgetCallAt < 0 || anthropicAt < 0 || budgetCallAt > anthropicAt) {
  fail('decideGlobalBudget must run before the Anthropic call');
}
const turnstileAt = source.search(/await\s+verifyTurnstile\s*\(/);
if (turnstileAt > budgetCallAt) fail('Turnstile must not be skipped before the budget/model path');

if (!source.includes('PER_ISOLATE_SUPPLEMENTAL_ONLY')) {
  fail('per-isolate Maps must be classified as supplemental, not global');
}
if (!source.includes('const turnstileOk = await verifyTurnstile')) {
  fail('Turnstile result must come from verifyTurnstile, not a hardcoded true');
}
if (/const turnstileOk\s*=\s*true/.test(source)) fail('Turnstile verification is hardcoded true');
if (/service is live today/i.test(source)) fail('AI fail-open live-service path present');

if (!budget.includes('global_budget_authority_unavailable')) fail('budget contract missing unavailable code');
if (!budget.includes('global_budget_denied')) fail('budget contract missing deny code');
if (!budget.includes('global_budget_malformed')) fail('budget contract missing malformed code');
if (!/decision\.allow === true/.test(budget)) fail('budget contract must require an explicit allow');

const required = [
  'quote_candidate',
  'MAX_BODY_BYTES',
  'validateMessages',
  'origin_not_allowed',
  'AbortSignal.timeout',
  'TURNSTILE_SECRET_KEY',
  'privacy_acknowledged',
  'cost_circuit_open',
  'rate_limited',
  'client_authority_rejected',
  'global_budget_authority_unavailable',
];
for (const token of required) {
  if (!source.includes(token) && !budget.includes(token)) fail(`missing boundary token: ${token}`);
}

console.log('chatbot-public-form-boundary: PASS');
