# Tellinex website commercial readiness R2 compose

CURSOR builder batch. Final independent assurance remains CLAUDE.
This repository is the **future canonical commercial website**.
`RST1986/Tellinex-landing` remains the temporary/legacy public interest-registration property until a later, separately authorised cutover.

DO NOT cut over tellinex.com from this branch.
DO NOT delete Tellinex-landing.
DO NOT deploy.

## Composed base

- `origin/main` at composition time: recorded in the PR
- PR #19 commercial truth / no fake success / no public control plane
- PR #16 governed public-form callers (Contact, Availability, Status)
- R2 blocker remediations: Turnstile hostname+action
- Abuse-control architecture validation: Pages Rate Limiting binding is **not supported**

## Public forms

REGISTER, CONTACT, AVAILABILITY, STATUS:

browser → client validation → Turnstile → submit-public-form → server validation → governed write → confirmed response → success UI

No browser direct table writes. Reviews remain gateway-backed for writes; public read of reviews may use the anon key.

## Official Cloudflare evidence (Pages Rate Limiting binding)

`PAGES_RATE_LIMIT_BINDING_SUPPORTED=NO`

| Source | Finding |
|---|---|
| [Migrate from Pages to Workers — compatibility matrix](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/) (updated 14 Aug 2026) | Bindings row **Rate Limiting**: Workers ✅, Pages ❌ |
| [Pages Functions bindings](https://developers.cloudflare.com/pages/functions/bindings/) | "Pages Functions only support a subset of all bindings, which are listed on this page." Rate Limiting is not listed. |
| [Pages wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/) | Non-inheritable keys include vars, D1, Durable Objects, Hyperdrive, KV, Queues producers, R2, Vectorize, services, Analytics Engine, AI. No `ratelimits`. |
| [Workers Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) | Documented for Workers (`main`, Wrangler ≥ 4.36.0). Per-location, eventually consistent, not an accounting system. Cloudflare does **not** recommend IP keys (CGNAT / shared networks). `namespace_id` is an account-unique integer **you define as a string**, not a platform-allocated UUID. |

Wrangler accepting `[[ratelimits]]` in a Pages `wrangler.toml` during `pages functions build` is **not** proof that Pages runtime exposes `env.MY_RATE_LIMITER.limit({ key })`.

## Selected architecture

`SELECTED_ABUSE_ARCHITECTURE=WAF_RATE_LIMITING_PLUS_TURNSTILE_ORIGIN_BOUNDS`

| Option | Pages supported | Distributed | Cost control | Complexity | False-positive risk | Recommended |
|---|---|---|---|---|---|---|
| Pages Rate Limit binding | NO | N/A | NO | Low if it existed | HIGH if IP-keyed | NO |
| WAF rate limiting rule | YES (zone security, not a Pages binding) | Per data centre; not a precise origin cap | NO (request count, not dollars) | Low ops | HIGH if IP-only on Jamaica/mobile CGNAT; lower if plan has IP with NAT and path-scoped `/api/ai-chat` | **YES** |
| Dedicated Worker | YES, as a separate Worker | Per-location limiter | NO | Extra deployable + routes | Same keying caveats | NO for this site (ops) |
| Service-bound Worker | YES (Pages can bind services) | Same as Worker | NO | Two artefacts | Same | NO |
| Durable Object | PARTIAL (separate Worker required; cannot create DO inside Pages) | Stronger consistency | NO | High | Depends on key | NO |
| KV / D1 counters | YES | Eventually consistent / extra infra | Weak DIY | High | Depends on key | NO |
| AI Gateway spend limits | N/A to Pages Functions until traffic is routed through a gateway | Spend, not request abuse | YES (dollar budget, eventually consistent) | New remote product | Low for budget | Later **COST** gate, not this request-abuse gate |

Prefer SIMPLE SUPPORTED AUDITABLE FAIL-CLOSED LOW-OPS: **zone WAF rate limiting** for `POST /api/ai-chat`, plus existing Turnstile (success + exact hostname + exact action), Origin allowlist, payload/message/token ceilings, and a fixed server model.

This PR does **not** create the WAF rule.

## Keying

- `IP_ONLY_KEYING_RECOMMENDED=NO` — official Workers Rate Limiting docs: do not key on IP/location; WAF Free/Pro default characteristic is IP.
- Jamaica / mobile CGNAT: `CGNAT_FALSE_POSITIVE_RISK=HIGH` for IP-only counting.
- Layered controls: coarse WAF (path-scoped; IP with NAT if the zone plan allows) + Turnstile + Origin + hard ceilings (`MAX_BODY_BYTES`, `MAX_MESSAGES`, `MAX_MESSAGE_CHARS`, `MAX_TOKENS`).
- `PRIVACY_INVASIVE_FINGERPRINTING=NO` — no canvas, device, hidden persistent IDs, JA3/JA4, or third-party tracking as an abuse key.
- `cf-connecting-ip` is used only as an optional Turnstile `remoteip` hint at the Cloudflare edge. `x-forwarded-for` is not identity.

## REQUEST_ABUSE_CONTROL vs COST_BUDGET_CONTROL

These are different planes.

**REQUEST_ABUSE_CONTROL** (this gate): stop bot/script floods of `/api/ai-chat`. Source-ready: Turnstile + Origin + bounds; WAF rule required later. App must **not** 503 forever because an unsupported Pages binding is absent.

Official WAF: [Rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/) — per-data-centre counters, possible delay before enforcement, not a precise origin allowance.

**COST_BUDGET_CONTROL** (not source-ready here): stop paid-token wallet drain.

Official capabilities only:

- Cloudflare [AI Gateway spend limits](https://developers.cloudflare.com/ai-gateway/features/spend-limits/) — dollar budgets, distinct from request rate limits; eventually consistent; requires routing through AI Gateway (not wired; not created here).
- Anthropic [rate limits and spend limits](https://docs.anthropic.com/en/api/rate-limits) — organisation/workspace monthly spend cap and RPM/ITPM/OTPM in the Claude Console, not in this Pages Function.

Application `MAX_TOKENS=512` and a fixed Haiku model are **ceilings**, not a budget.

`COST_BUDGET_CONTROL_SOURCE_READY=NO`

## AI chat application boundary (this PR)

- Turnstile `success`, exact hostname, exact action `tellinex_ai_chat`
- Missing token → 400; invalid/wrong hostname/action → 403
- Client cannot set model, system, or max_tokens
- Process-local `Map()` is **not** a security control
- `[[ratelimits]]` is **removed** from Pages `wrangler.toml` (unsupported, must not look production-valid)
- `APPLICATION_RATE_LIMIT_BINDING_REQUIRED=NO`
- `EDGE_ABUSE_CONTROL_REQUIRED=YES`
- `WAF_RATE_LIMIT_RUNTIME_PROVEN=NO`
- Missing Anthropic/Turnstile secrets still fail closed (503)
- `cf-connecting-ip` only at the Cloudflare edge; `x-forwarded-for` is not identity

## Residuals (honest)

- WAF rate-limit rule is **not** deployed. `ABUSE_CONTROL_RUNTIME_PROVEN=NO`
- Cost budget (AI Gateway or Anthropic Console) is **not** wired
- Legal pages remain DRAFT
- `COMMERCIAL_LIVE=NO`
- Independent assurance still required
- This PR does not close TCC #313
- `READY_FOR_PRODUCTION=NO`

## Local proofs

```
npm ci
npm run typecheck
npm run build
npm run release:check
npx wrangler@4 pages functions build --outdir=.wrangler-pages-functions-check
```

`release:check` does not deploy. Wrangler Pages Functions build does not prove a WAF rule exists.
