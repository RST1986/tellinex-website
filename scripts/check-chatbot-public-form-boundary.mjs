import fs from 'node:fs';

const source = fs.readFileSync('functions/api/ai-chat.js', 'utf8');
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

const required = [
  'quote_candidate',
  'quote_persisted: false',
  'MAX_BODY_BYTES',
  'validateMessages',
  'origin_not_allowed',
  'AbortSignal.timeout',
];
for (const token of required) {
  if (!source.includes(token)) fail(`missing boundary token: ${token}`);
}

console.log('chatbot-public-form-boundary: PASS');
