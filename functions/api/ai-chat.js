// Cloudflare Pages Function — served at /api/ai-chat
// Public chat endpoint. It never writes directly to Supabase public-form tables.
// AI != AUTHORITY. FAIL CLOSED when required bindings are absent.
// This file does not create Cloudflare resources.
//
// AI_CHAT_DURABLE_RATE_LIMIT_REQUIRED=YES
// AI_CHAT_LOCAL_MAP_IS_SECURITY_CONTROL=NO
// Process-local Map() is not a production abuse control across isolates/PoPs.
// The official control is the Workers Rate Limiting binding (per-location).
// If the binding is not present at runtime, chat fails closed.

export const TURNSTILE_ACTION = 'tellinex_ai_chat';
export const PRODUCTION_ORIGINS = Object.freeze([
  'https://tellinex.com',
  'https://www.tellinex.com',
]);
export const PRODUCTION_TURNSTILE_HOSTNAMES = Object.freeze([
  'tellinex.com',
  'www.tellinex.com',
]);

const MAX_BODY_BYTES = 32_768;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 4_000;
const MAX_TOKENS = 512;
const MAX_TURNSTILE_TOKEN_CHARS = 2048;
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
const ACTION_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;
const HOSTNAME_PATTERN = /^[a-z0-9.-]+$/;

const SYSTEM_PROMPT = `You are a public assistant for Tellinex Limited, which is building resilient digital infrastructure in Jamaica.
You are not commercial authority. You cannot invent coverage, pricing, launch dates, partnerships, certifications, or operational status.
Plans are not live services. Targets are not current coverage. Design intent is not a guarantee. Draft prices are not contractual offers.
Do not claim storm-absolute guarantees or unresolved primacy status.
If asked for a quote, collect only information the visitor volunteers. Once you have an email or phone, you may append one hidden marker:
<!--CUSTOMER:{"name":"","email":"","phone":"","address":"","service":"residential","bandwidth":""}-->
The marker prepares a quote candidate only. It does not confirm storage or submission.
If you do not know, say so and point the visitor to info@tellinex.com or the interest-registration form.`;

function isLocalDev(env) {
  return env?.AI_CHAT_LOCAL_DEV === 'YES' && env?.CF_PAGES !== '1' && env?.CF_PAGES !== 'true';
}

function parseExactList(raw, { allowLocalhost }) {
  if (typeof raw !== 'string') return [];
  const items = raw.split(',').map((item) => item.trim()).filter(Boolean);
  const parsed = [];
  for (const item of items) {
    if (item.includes('*') || item.includes(' ') || item.includes('/') || item.startsWith('.')) {
      return null;
    }
    const localhost = item === 'localhost' || item === '127.0.0.1' || item.startsWith('http://localhost') || item.startsWith('http://127.0.0.1');
    if (localhost && !allowLocalhost) return null;
    parsed.push(item);
  }
  return parsed;
}

function allowedOrigins(env) {
  const extra = parseExactList(env?.AI_CHAT_ALLOWED_ORIGINS || '', { allowLocalhost: isLocalDev(env) });
  if (extra === null) return new Set();
  return new Set([...PRODUCTION_ORIGINS, ...extra]);
}

function isAllowedOrigin(origin, env) {
  if (!origin) return false;
  return allowedOrigins(env).has(origin);
}

function expectedTurnstileHostnames(env) {
  const configured = (env?.TURNSTILE_EXPECTED_HOSTNAMES || '').trim();
  const source = configured
    ? parseExactList(configured.toLowerCase(), { allowLocalhost: isLocalDev(env) })
    : [...PRODUCTION_TURNSTILE_HOSTNAMES];
  if (!source || source.length === 0) return new Set();
  const hosts = new Set();
  for (const item of source) {
    const hostname = item.toLowerCase();
    if (!HOSTNAME_PATTERN.test(hostname) || hostname.includes('..')) return new Set();
    hosts.add(hostname);
  }
  return hosts;
}

function expectedTurnstileAction(env) {
  const configured = (env?.TURNSTILE_AI_CHAT_ACTION || '').trim();
  if (!configured) return TURNSTILE_ACTION;
  if (!ACTION_PATTERN.test(configured)) return null;
  return configured;
}

function corsHeaders(origin, env) {
  const headers = {
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'Vary': 'Origin',
  };
  if (origin && isAllowedOrigin(origin, env)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

function json(origin, env, status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin, env), ...extraHeaders },
  });
}

function connectingIp(request) {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (typeof cfIp === 'string' && cfIp.trim()) return cfIp.trim();
  return null;
}

async function enforceDurableRateLimit(env, request) {
  const limiter = env?.AI_CHAT_RATE_LIMITER;
  if (!limiter || typeof limiter.limit !== 'function') {
    return { ok: false, status: 503, code: 'durable_rate_limit_required', message: 'Chat is temporarily unavailable.' };
  }

  const ip = connectingIp(request);
  let key;
  if (ip) {
    key = `ai-chat:${ip}`;
  } else if (isLocalDev(env)) {
    key = 'ai-chat:local-dev';
  } else {
    return { ok: false, status: 403, code: 'client_identity_unavailable', message: 'This request cannot be attributed at the trusted edge.' };
  }

  const result = await limiter.limit({ key });
  if (!result || result.success !== true) {
    return { ok: false, status: 429, code: 'rate_limited', message: 'Too many chat requests. Please try again later.' };
  }
  return { ok: true };
}

function validateMessages(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_MESSAGES) {
    throw new Error('invalid_messages');
  }
  return value.map((message) => {
    if (!message || typeof message !== 'object') throw new Error('invalid_messages');
    if (message.role !== 'user' && message.role !== 'assistant') {
      throw new Error('invalid_messages');
    }
    if (typeof message.content !== 'string') throw new Error('invalid_messages');
    const content = message.content.trim();
    if (!content || content.length > MAX_MESSAGE_CHARS) throw new Error('invalid_messages');
    return { role: message.role, content };
  });
}

function normalizeOptionalText(value, maximum) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.slice(0, maximum);
}

function extractQuoteCandidate(text) {
  const match = text.match(/<!--CUSTOMER:(\{[\s\S]*?\})-->/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]);
    const email = normalizeOptionalText(parsed.email, 254);
    const phone = normalizeOptionalText(parsed.phone, 25);
    if (!email && !phone) return null;
    const allowedServices = new Set([
      'residential',
      'business',
      'enterprise',
      'wholesale',
      'dark_fibre',
    ]);
    const service = allowedServices.has(parsed.service) ? parsed.service : 'residential';
    return {
      customer_name: normalizeOptionalText(parsed.name, 120),
      customer_email: email,
      customer_phone: phone,
      location: normalizeOptionalText(parsed.address, 500),
      service_requested: service,
      quote_type: service,
      bandwidth_required: normalizeOptionalText(parsed.bandwidth, 100),
    };
  } catch {
    return null;
  }
}

function stripPrivateMarkers(text) {
  return text
    .replace(/<!--CUSTOMER:[\s\S]*?-->/g, '')
    .replace(/<!--ADDRESS:[\s\S]*?-->/g, '')
    .trim();
}

async function verifyTurnstile({ secret, token, ip, env }) {
  const expectedAction = expectedTurnstileAction(env);
  const expectedHostnames = expectedTurnstileHostnames(env);
  if (!expectedAction || expectedHostnames.size === 0) {
    return { ok: false, status: 503, code: 'turnstile_misconfigured' };
  }

  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', token);
  if (ip) body.set('remoteip', ip);

  let data;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return { ok: false, status: 403, code: 'turnstile_failed' };
    data = await response.json();
  } catch {
    return { ok: false, status: 403, code: 'turnstile_failed' };
  }

  if (data?.success !== true) {
    return { ok: false, status: 403, code: 'turnstile_failed' };
  }
  if (data.action !== expectedAction) {
    return { ok: false, status: 403, code: 'turnstile_action_mismatch' };
  }
  const hostname = typeof data.hostname === 'string' ? data.hostname.trim().toLowerCase() : '';
  if (!expectedHostnames.has(hostname)) {
    return { ok: false, status: 403, code: 'turnstile_hostname_mismatch' };
  }
  return { ok: true };
}

export async function onRequest(context) {
  const { request, env } = context;
  const origin = request.headers.get('origin');

  if (request.method === 'OPTIONS') {
    if (origin && !isAllowedOrigin(origin, env)) {
      return json(null, env, 403, { code: 'origin_not_allowed', message: 'This origin is not allowed.' });
    }
    return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
  }

  if (origin && !isAllowedOrigin(origin, env)) {
    return json(null, env, 403, { code: 'origin_not_allowed', message: 'This origin is not allowed.' });
  }
  if (request.method === 'POST' && !origin) {
    return json(null, env, 403, { code: 'origin_not_allowed', message: 'This origin is not allowed.' });
  }

  if (request.method !== 'POST') {
    return json(origin, env, 405, { code: 'method_not_allowed', message: 'Only POST is supported.' }, { Allow: 'POST, OPTIONS' });
  }

  const apiKey = env.ANTHROPIC_API_KEY;
  const turnstileSecret = env.TURNSTILE_SECRET_KEY;
  if (!apiKey || !turnstileSecret) {
    return json(origin, env, 503, { code: 'service_unavailable', message: 'Chat is temporarily unavailable.' });
  }

  const contentType = request.headers.get('content-type')?.toLowerCase() || '';
  if (!contentType.startsWith('application/json')) {
    return json(origin, env, 415, { code: 'unsupported_media_type', message: 'Content-Type must be application/json.' });
  }

  const declaredLength = Number.parseInt(request.headers.get('content-length') || '', 10);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json(origin, env, 413, { code: 'payload_too_large', message: 'The request is too large.' });
  }

  const limited = await enforceDurableRateLimit(env, request);
  if (!limited.ok) {
    const extra = limited.status === 429 ? { 'Retry-After': '60' } : {};
    return json(origin, env, limited.status, { code: limited.code, message: limited.message }, extra);
  }

  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return json(origin, env, 413, { code: 'payload_too_large', message: 'The request is too large.' });
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return json(origin, env, 400, { code: 'invalid_json', message: 'The request body is not valid JSON.' });
    }

    if (body?.system || body?.model || body?.max_tokens) {
      return json(origin, env, 400, { code: 'client_authority_rejected', message: 'The client cannot set model, system, or token authority.' });
    }

    if (body?.privacy_acknowledged !== true) {
      return json(origin, env, 400, { code: 'privacy_required', message: 'Acknowledge the AI privacy notice before sending a message.' });
    }

    const turnstileToken = typeof body?.turnstile_token === 'string' ? body.turnstile_token.trim() : '';
    if (!turnstileToken) {
      return json(origin, env, 400, { code: 'turnstile_required', message: 'Complete the security check before chatting.' });
    }
    if (turnstileToken.length > MAX_TURNSTILE_TOKEN_CHARS) {
      return json(origin, env, 400, { code: 'turnstile_required', message: 'Complete the security check before chatting.' });
    }

    const turnstile = await verifyTurnstile({
      secret: turnstileSecret,
      token: turnstileToken,
      ip: connectingIp(request),
      env,
    });
    if (!turnstile.ok) {
      return json(origin, env, turnstile.status, {
        code: turnstile.code,
        message: 'The security check was not accepted.',
      });
    }

    const messages = validateMessages(body?.messages);

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!upstream.ok) {
      return json(origin, env, 503, { code: 'upstream_unavailable', message: 'Chat is temporarily unavailable.' });
    }

    const data = await upstream.json();
    const text = data?.content?.[0]?.text;
    if (typeof text !== 'string' || !text.trim()) {
      return json(origin, env, 503, { code: 'invalid_upstream_response', message: 'Chat is temporarily unavailable.' });
    }

    const quoteCandidate = extractQuoteCandidate(text);
    data.content[0].text = stripPrivateMarkers(text);

    return json(origin, env, 200, {
      ...data,
      quote_candidate: quoteCandidate,
      quote_persisted: false,
    });
  } catch (error) {
    const code = error instanceof Error && error.message === 'invalid_messages'
      ? 'invalid_messages'
      : 'service_unavailable';
    const status = code === 'invalid_messages' ? 400 : 503;
    return json(origin, env, status, {
      code,
      message: code === 'invalid_messages'
        ? 'Messages must be a bounded array of user and assistant text messages.'
        : 'Chat is temporarily unavailable.',
    });
  }
}
