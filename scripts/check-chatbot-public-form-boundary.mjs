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
  'AI_CHAT_RATE_LIMITER',
  'AI_CHAT_DURABLE_RATE_LIMIT_REQUIRED=YES',
  'durable_rate_limit_required',
  'tellinex_ai_chat',
  'turnstile_hostname_mismatch',
  'turnstile_action_mismatch',
  'cf-connecting-ip',
];
for (const token of required) {
  if (!source.includes(token)) fail(`missing boundary token: ${token}`);
}

if (!widget.includes('action="tellinex_ai_chat"')) fail('widget action must be tellinex_ai_chat');
if (widget.includes('system:') || widget.includes('TELLINEX_SYSTEM_PROMPT')) {
  fail('widget must not send a system prompt');
}

console.log('chatbot-public-form-boundary: PASS');
