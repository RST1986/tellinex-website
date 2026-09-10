# Production runtime observability — tellinex.com

Status vocabulary is evidence-based. A successful build or Cloudflare upload is not, by itself, proof that every runtime dependency is usable.

## Current production contract

| Control | State | Evidence meaning |
|---|---|---|
| GitHub `main` -> Cloudflare Pages deployment | ENFORCED | `deploy-production.yml` deploys only `refs/heads/main` and records `$GITHUB_SHA`. |
| Static live-bundle equivalence | ENFORCED | Post-deploy proof hashes the production JS bundle and compares it with the gated build. |
| Public sitemap / DPA truth checks | ENFORCED | Post-deploy proof rejects missing `/availability`, missing DPA disclosure, and the withdrawn email promise. |
| AI Pages Function mounted | PROBED_AFTER_DEPLOY | `probe-production-ai-runtime.mjs` calls `/api/ai-chat` on the production origin. |
| Required AI server-side bindings present | PROBED_AFTER_DEPLOY | Deliberately omitting the Turnstile token must reach `400 turnstile_required`; missing `ANTHROPIC_API_KEY` or `TURNSTILE_SECRET_KEY` fails earlier with `503 service_unavailable`. |
| Turnstile challenge acceptance | NOT_PROBED | A valid visitor challenge is intentionally not fabricated by CI. |
| Anthropic credential validity / upstream response | NOT_PROBED | The readiness probe never passes Turnstile and therefore makes no paid Anthropic request. |
| WAF rate-limit runtime proof | NO | Edge abuse control remains a separate Cloudflare configuration/evidence workstream. |
| AI cost-budget control proof | NO | Provider/AI Gateway budget enforcement remains a separate workstream. |

## Non-paid AI runtime probe

Run:

```bash
node scripts/probe-production-ai-runtime.mjs
```

Optional target override for an authorised HTTPS environment:

```bash
TELLINEX_RUNTIME_BASE_URL=https://example.pages.dev node scripts/probe-production-ai-runtime.mjs
```

Expected production response:

```text
HTTP 400
{"code":"turnstile_required",...}
```

This is deliberately a negative-path probe. In the production function, required server-side bindings are checked before body/Turnstile validation. Reaching `turnstile_required` therefore proves that the deployed route is mounted and that the two required bindings passed the presence gate, while stopping before Turnstile siteverify and before any Anthropic request.

## What this must never claim

A green `AI_RUNTIME_CONFIG_GATE` does **not** prove a valid Anthropic API key, a redeemable Turnstile token, WAF rate limiting, budget enforcement, model quality, commercial authority, or end-to-end chat availability. Those require separate evidence.

## Next runtime gates

1. Capture Cloudflare WAF rate-limit rule evidence for `POST /api/ai-chat` and change `WAF_RATE_LIMIT_RUNTIME_PROVEN` only after an authorised negative/threshold test.
2. Configure and prove an AI spend/budget control at the provider or gateway layer without embedding secrets in GitHub documentation.
3. Add an authorised end-to-end canary only if a safe mechanism exists for obtaining a real Turnstile token without weakening anti-abuse controls.
