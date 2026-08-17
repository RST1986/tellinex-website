# Tellinex website commercial readiness R1

CURSOR builder batch. Final independent assurance remains CLAUDE.
This repository is the future commercial website, not the temporary landing page.

## Composed base

- `origin/main`: `ccffee23474bbd277b66c6112f35461ebda91c80`
- P0 parent (not rewritten): `4d34e1592d8b740745c066309fdad941cb8157dc`
- Branch: `hardening/tellinex-website-commercial-readiness-r1`

P0 already removed public OpusHealth, `opus-diagnose`, and the obsolete guardian cron.
`PUBLIC_AUTO_HEAL_ENDPOINTS=0`
`PUBLIC_REDEPLOY_ENDPOINTS=0`
`PUBLIC_TCC_CONTROL_ENDPOINTS=0`
Future home for those capabilities: TCC private control plane.

## What this batch removed or governed

- Hurricane-Proof / Category 5 / first-in-Jamaica public claims
- Fabricated countdown and unapproved launch date
- 425K homes and “14 parishes covered” as current facts
- Draft prices and unapproved SLAs as public offers
- Fake contact `Message sent!` success
- Browser AI system-prompt authority and invented commercial facts
- Hardcoded Supabase JWT in Reviews
- Obsolete `vercel.json`

## Facts governance

All quantitative public claims must come from `src/app/content/commercialFacts.ts`.

| Topic | Class | Public |
|---|---|---|
| Positioning | CURRENT_VERIFIED | yes |
| Underground-first design | PLANNED | yes as design principle |
| Current coverage | CURRENT_VERIFIED = not live national service | yes |
| National expansion | PLANNED | yes as planned |
| 425K homes | UNVERIFIED_NOT_PUBLIC | no |
| 180,000 homes | TARGET | no as live figure |
| 14 parishes covered | UNVERIFIED_NOT_PUBLIC | no |
| Launch date | NULL | no countdown |
| Draft prices | DRAFT | no |
| SLA percents | TARGET/DRAFT | not as commitments |
| First-in-Jamaica | unresolved | FIRST_CLAIM_REQUIRES_INDEPENDENT_EVIDENCE=YES |

## Residuals

- `@netlify/functions` remains in `package.json` because P0 deferred lockfile/package composition. Unused. Not a public runtime.
- PR #16 still owns Availability/Status/CI caller-contract files. This branch adds privacy/terms routes and a disabled contact form; compose carefully.
- Anon key must be supplied via `VITE_SUPABASE_ANON_KEY` for public review reads. No service-role key in the browser.
- CSP `style-src 'unsafe-inline'` debt is documented. Existing inline styles require it.
- Legal pages are DRAFT. `LEGAL_REVIEW_REQUIRED=YES`. No invented company number, address, or licence.
- Biographies are `FOUNDER_PROVIDED_UNVERIFIED`. No invented corrections.
- `COMMERCIAL_LIVE=NO`. Ready for Claude assurance, not production cutover.

## Local proofs

```
npm ci
npm run typecheck
npm run build
npm run release:check
```

`release:check` does not deploy.
