# Chatbot public-form boundary — 2026-07-31

## Result

The public website chatbot no longer writes directly to `public.quote_requests` and no longer requires `SUPABASE_ANON_KEY` for quote persistence.

The endpoint now:

- validates the request origin, method, content type and body size;
- accepts only a bounded user/assistant text message array;
- calls the configured Anthropic model with a timeout;
- strips hidden customer markers from the visible reply;
- returns an optional bounded `quote_candidate` object;
- always declares `quote_persisted: false`;
- performs no public-form table write.

A build-blocking checker forbids direct `quote_requests` REST/client tokens and `SUPABASE_ANON_KEY` from the chatbot function.

## Follow-on

Persistence of quote requests must use the protected `submit-public-form` gateway after browser-side Turnstile verification. Until that caller exists, the chatbot remains advisory and non-persistent.

## Scope

Website repository only. No database, Supabase secret, staging grant or production database change.
