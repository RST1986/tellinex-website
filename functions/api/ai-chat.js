// Cloudflare Pages Function — served at /api/ai-chat
// Public chat endpoint. It never writes directly to Supabase public-form tables.
// AI != AUTHORITY. FAIL CLOSED when required bindings are absent.
// This file does not create Cloudflare resources.

const ALLOWED_ORIGINS = new Set([
  'https://tellinex.com',
  'https://www.tellinex.com',
]);
const MAX_BODY_BYTES = 32_768;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 4_000;
const MAX_TOKENS = 512;
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT_PER_WINDOW = 8;
const COST_WINDOW_MS = 60 * 60 * 1000;
const COST_TOKEN_BUDGET = 40_000;

const requestCounts = new Map();
const tokenSpend = new Map();

const SYSTEM_PROMPT = `You are a public assistant for Tellinex Limited, which is building resilient digital infrastructure in Jamaica.
You are not commercial authority. You cannot invent coverage, pricing, launch dates, partnerships, certifications, or operational status.
Plans are not live services. Targets are not current coverage. Design intent is not a guarantee. Draft prices are not contractual offers.
Do not claim storm-absolute guarantees or unresolved primacy status.
If asked for a quote, collect only information the visitor volunteers. Once you have an email or phone, you may append one hidden marker:
<!--CUSTOMER:{"name":"","email":"","phone":"","address":"","service":"residential","bandwidth":""}-->
The marker prepares a quote candidate only. It does not confirm storage or submission.
If you do not know, say so and point the visitor to info@tellinex.com or the interest-registration form.`;

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const url = new URL(origin);
    return url.protocol === 'https:' &&
      url.username === '' &&
      url.password === '' &&
      url.port === '' &&
      (url.hostname === 'tellinex-website.pages.dev' ||
        url.hostname.endsWith('.tellinex-website.pages.dev'));
  } catch {
    return false;
  }
}

function corsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'Vary': 'Origin',
  };
  if (origin && isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

function json(origin, status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), ...extraHeaders },
  });
}

function clientKey(request) {
  return request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for') ||
    'unknown';
}

function takeRateLimit(key) {
  const now = Date.now();
  const current = requestCounts.get(key);
  if (!current || now - current.startedAt > RATE_WINDOW_MS) {
    requestCounts.set(key, { startedAt: now, count: 1 });
    return true;
  }
  if (current.count >= RATE_LIMIT_PER_WINDOW) return false;
  current.count += 1;
  return true;
}

function takeCostBudget(key, tokens) {
  const now = Date.now();
  const current = tokenSpend.get(key);
  if (!current || now - current.startedAt > COST_WINDOW_MS) {
    tokenSpend.set(key, { startedAt: now, tokens });
    return tokens <= COST_TOKEN_BUDGET;
  }
  if (current.tokens + tokens > COST_TOKEN_BUDGET) return false;
  current.tokens += tokens;
  return true;
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

async function verifyTurnstile(secret, token, ip) {
  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', token);
  if (ip && ip !== 'unknown') body.set('remoteip', ip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) return false;
  const data = await response.json();
  return data?.success === true;
}

export async function onRequest(context) {
  const { request, env } = context;
  const origin = request.headers.get('origin');

  if (origin && !isAllowedOrigin(origin)) {
    return json(null, 403, { code: 'origin_not_allowed', message: 'This origin is not allowed.' });
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (request.method !== 'POST') {
    return json(origin, 405, { code: 'method_not_allowed', message: 'Only POST is supported.' }, { Allow: 'POST, OPTIONS' });
  }

  const apiKey = env.ANTHROPIC_API_KEY;
  const turnstileSecret = env.TURNSTILE_SECRET_KEY;
  if (!apiKey || !turnstileSecret) {
    return json(origin, 503, { code: 'service_unavailable', message: 'Chat is temporarily unavailable.' });
  }

  const contentType = request.headers.get('content-type')?.toLowerCase() || '';
  if (!contentType.startsWith('application/json')) {
    return json(origin, 415, { code: 'unsupported_media_type', message: 'Content-Type must be application/json.' });
  }

  const declaredLength = Number.parseInt(request.headers.get('content-length') || '', 10);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json(origin, 413, { code: 'payload_too_large', message: 'The request is too large.' });
  }

  const key = clientKey(request);
  if (!takeRateLimit(key)) {
    return json(origin, 429, { code: 'rate_limited', message: 'Too many chat requests. Please try again later.' }, { 'Retry-After': '60' });
  }

  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return json(origin, 413, { code: 'payload_too_large', message: 'The request is too large.' });
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return json(origin, 400, { code: 'invalid_json', message: 'The request body is not valid JSON.' });
    }

    if (body?.system || body?.model || body?.max_tokens) {
      return json(origin, 400, { code: 'client_authority_rejected', message: 'The client cannot set model, system, or token authority.' });
    }

    if (body?.privacy_acknowledged !== true) {
      return json(origin, 400, { code: 'privacy_required', message: 'Acknowledge the AI privacy notice before sending a message.' });
    }

    const turnstileToken = typeof body?.turnstile_token === 'string' ? body.turnstile_token.trim() : '';
    if (!turnstileToken) {
      return json(origin, 400, { code: 'turnstile_required', message: 'Complete the security check before chatting.' });
    }
    const turnstileOk = await verifyTurnstile(turnstileSecret, turnstileToken, key);
    if (!turnstileOk) {
      return json(origin, 403, { code: 'turnstile_failed', message: 'The security check was not accepted.' });
    }

    const messages = validateMessages(body?.messages);
    if (!takeCostBudget(key, MAX_TOKENS)) {
      return json(origin, 429, { code: 'cost_circuit_open', message: 'Chat is temporarily unavailable.' });
    }

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
      return json(origin, 503, { code: 'upstream_unavailable', message: 'Chat is temporarily unavailable.' });
    }

    const data = await upstream.json();
    const text = data?.content?.[0]?.text;
    if (typeof text !== 'string' || !text.trim()) {
      return json(origin, 503, { code: 'invalid_upstream_response', message: 'Chat is temporarily unavailable.' });
    }

    const quoteCandidate = extractQuoteCandidate(text);
    data.content[0].text = stripPrivateMarkers(text);

    return json(origin, 200, {
      ...data,
      quote_candidate: quoteCandidate,
      quote_persisted: false,
    });
  } catch (error) {
    const code = error instanceof Error && error.message === 'invalid_messages'
      ? 'invalid_messages'
      : 'service_unavailable';
    const status = code === 'invalid_messages' ? 400 : 503;
    return json(origin, status, {
      code,
      message: code === 'invalid_messages'
        ? 'Messages must be a bounded array of user and assistant text messages.'
        : 'Chat is temporarily unavailable.',
    });
  }
}
