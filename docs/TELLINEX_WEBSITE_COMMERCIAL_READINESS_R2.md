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
- R2 blocker remediations: Turnstile hostname+action, durable rate-limit truth

## Public forms

REGISTER, CONTACT, AVAILABILITY, STATUS:

browser → client validation → Turnstile → submit-public-form → server validation → governed write → confirmed response → success UI

No browser direct table writes. Reviews remain gateway-backed for writes; public read of reviews may use the anon key.

## AI chat abuse boundary

- Turnstile `success`, exact hostname, exact action `tellinex_ai_chat`
- Missing token → 400; invalid/wrong hostname/action → 403
- Client cannot set model, system, or max_tokens
- Official Workers Rate Limiting binding declared in `wrangler.toml` (source only)
- Missing binding fails closed (`durable_rate_limit_required`)
- Process-local `Map()` is **not** a security control
- `AI_CHAT_DURABLE_RATE_LIMIT_REQUIRED=YES`
- Remote bind/deploy of the limiter is a later infrastructure gate
- `cf-connecting-ip` only at the Cloudflare edge; `x-forwarded-for` is not identity

## Residuals (honest)

- Durable AI abuse control is **BLOCKED_INFRA_GATE** until a later authorised Pages deploy actually binds `AI_CHAT_RATE_LIMITER`
- Legal pages remain DRAFT
- `COMMERCIAL_LIVE=NO`
- Independent assurance still required
- This PR does not close TCC #313

## Local proofs

```
npm ci
npm run typecheck
npm run build
npm run release:check
```

`release:check` does not deploy.
