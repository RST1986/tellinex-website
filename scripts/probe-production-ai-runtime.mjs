#!/usr/bin/env node
/**
 * Non-paid production readiness probe for the public AI chat function.
 *
 * The production function checks ANTHROPIC_API_KEY and TURNSTILE_SECRET_KEY
 * before it validates the request body. A deliberately missing Turnstile token
 * must therefore reach the 400/turnstile_required boundary when both required
 * server-side bindings are present. If either binding is absent, the function
 * fails closed with 503/service_unavailable instead.
 *
 * This probe does NOT prove that a Turnstile challenge can be redeemed, that an
 * Anthropic credential is valid, or that WAF/cost controls are enabled. It does
 * not send a valid Turnstile token and therefore does not make a paid Anthropic
 * request.
 */

const baseUrl = process.env.TELLINEX_RUNTIME_BASE_URL || 'https://tellinex.com';
let target;
let origin;

try {
  const parsed = new URL(baseUrl);
  if (parsed.protocol !== 'https:') throw new Error('base URL must use https');
  target = new URL('/api/ai-chat', parsed);
  origin = parsed.origin;
} catch (error) {
  console.error(`AI_RUNTIME_CONFIG_GATE=FAIL invalid base URL: ${error.message}`);
  process.exit(1);
}

let response;
try {
  response = await fetch(target, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin,
    },
    body: JSON.stringify({
      privacy_acknowledged: true,
      messages: [{ role: 'user', content: 'Tellinex production runtime readiness probe' }],
    }),
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
  });
} catch (error) {
  console.error(`AI_RUNTIME_CONFIG_GATE=FAIL request error: ${error.message}`);
  process.exit(1);
}

let body;
try {
  body = await response.json();
} catch {
  console.error(`AI_RUNTIME_CONFIG_GATE=FAIL status=${response.status} response was not JSON`);
  process.exit(1);
}

if (response.status === 503 && body?.code === 'service_unavailable') {
  console.error('AI_RUNTIME_CONFIG_GATE=FAIL required server-side AI/Turnstile binding is absent or unavailable');
  process.exit(1);
}

if (response.status !== 400 || body?.code !== 'turnstile_required') {
  console.error(`AI_RUNTIME_CONFIG_GATE=FAIL expected status=400 code=turnstile_required; got status=${response.status} code=${body?.code ?? 'missing'}`);
  process.exit(1);
}

console.log('AI_RUNTIME_CONFIG_GATE=PASS endpoint mounted; required server-side bindings reached the Turnstile boundary; no paid upstream request made');
