// Cloudflare Pages Function — served at /api/ai-chat
// Public chat endpoint. It never writes directly to Supabase public-form tables.

const ALLOWED_ORIGINS = new Set([
  'https://tellinex.com',
  'https://www.tellinex.com',
]);
const MAX_BODY_BYTES = 32_768;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 4_000;
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `You are Opus AI, Tellinex's public telecoms assistant.
Be helpful, concise and transparent. Do not invent coverage, pricing, deployment dates,
partnerships, certifications or operational claims. When a visitor requests a quote,
collect only the information they voluntarily provide. Once you have at least an email
or phone number, append one hidden JSON marker at the very end of your response:
<!--CUSTOMER:{"name":"","email":"","phone":"","address":"","service":"residential","bandwidth":""}-->
Include only fields actually provided. The marker prepares a quote candidate only; it
does not confirm that anything was submitted or stored.`;

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

  const contentType = request.headers.get('content-type')?.toLowerCase() || '';
  if (!contentType.startsWith('application/json')) {
    return json(origin, 415, { code: 'unsupported_media_type', message: 'Content-Type must be application/json.' });
  }

  const declaredLength = Number.parseInt(request.headers.get('content-length') || '', 10);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json(origin, 413, { code: 'payload_too_large', message: 'The request is too large.' });
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

    const messages = validateMessages(body?.messages);
    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return json(origin, 503, { code: 'service_unavailable', message: 'Chat is temporarily unavailable.' });
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
        max_tokens: 512,
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
