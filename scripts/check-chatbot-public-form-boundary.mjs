import fs from 'node:fs';

const source = fs.readFileSync('functions/api/ai-chat.js', 'utf8');
const widget = fs.readFileSync('src/app/components/AIChatWidget.tsx', 'utf8');
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
  'const requestCounts = new Map(',
  'const tokenSpend = new Map(',
  'x-forwarded-for',
];
for (const token of forbidden) {
  if (source.includes(token)) fail(`forbidden token present: ${token}`);
}

const required = [
  'quote_candidate',
  'quote_persisted: false',
  'MAX_BODY_BYTES',
  'validateMessages',
  'origin_not_allowed',
  'AbortSignal.timeout',
  'TURNSTILE_SECRET_KEY',
  'privacy_acknowledged',
  'client_authority_rejected',
  'EDGE_ABUSE_CONTROL_REQUIRED=YES',
  'WAF_RATE_LIMIT_RUNTIME_PROVEN=NO',
  'APPLICATION_RATE_LIMIT_BINDING_REQUIRED=NO',
  'tellinex_ai_chat',
  'turnstile_hostname_mismatch',
  'turnstile_action_mismatch',
  'cf-connecting-ip',
];
for (const token of required) {
  if (!source.includes(token)) fail(`missing boundary token: ${token}`);
}

if (source.includes('durable_rate_limit_required') || /\.limit\s*\(\s*\{\s*key/.test(source)) {
  fail('app must not require an unsupported Pages Rate Limiting binding');
}

const wrangler = fs.readFileSync('wrangler.toml', 'utf8');
if (/^\s*\[\[ratelimits\]\]/m.test(wrangler) || /^\s*name\s*=\s*"AI_CHAT_RATE_LIMITER"/m.test(wrangler) || /^\s*namespace_id\s*=/m.test(wrangler)) {
  fail('wrangler.toml must not declare unsupported Pages Rate Limiting bindings');
}
if (!wrangler.includes('EDGE_ABUSE_CONTROL_REQUIRED=YES') || !wrangler.includes('WAF_RATE_LIMIT_RUNTIME_PROVEN=NO')) {
  fail('wrangler.toml must declare WAF as the unproven edge abuse layer');
}

if (!widget.includes('action="tellinex_ai_chat"')) fail('widget action must be tellinex_ai_chat');
if (widget.includes('system:') || widget.includes('TELLINEX_SYSTEM_PROMPT')) {
  fail('widget must not send a system prompt');
}

console.log('chatbot-public-form-boundary: PASS');
