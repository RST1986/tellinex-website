# Production deployment receipts — tellinex.com

One entry per production deployment. A deployment without a receipt is drift.

The closure condition for any entry is:

```
RST1986/tellinex-website@<sha> -> attributable Cloudflare Pages deployment -> tellinex.com
                                -> verified live artefacts and content
```

---

## 2026-09-07 — `8312dbf` — RECOVERY DEPLOYMENT

| | |
|---|---|
| Repository | `RST1986/tellinex-website` |
| Branch | `main` |
| Commit SHA | `8312dbfe349e6ef7cdc0ee86737312ed407a9bc9` |
| Cloudflare account | `eb4da2a4f6742ca5facf8895af36af4b` |
| Pages project | `tellinex-website` |
| Deployment ID | `681faed0-9634-4017-b3c6-8f235a208797` |
| Deployment alias | `https://681faed0.tellinex-website.pages.dev` |
| Recorded source | `8312dbf` (via `--commit-hash`) |
| Custom domains | `tellinex.com`, `www.tellinex.com` |
| Mechanism | `wrangler pages deploy` from a clean checkout — **interim**, see below |
| Authorisation | explicit founder GO |

### Build inputs

```
node        22.22.2        (the build machine's version; .nvmrc and engines
                           now pin exactly 22.22.2 so this is reproducible —
                           at deploy time they said only "22", which selects
                           the latest 22.x and does NOT pin this build)
vite        5.4.21         (lockfile, lockfileVersion 3, npm ci)
build       npm run build  -> dist
env         VITE_PUBLIC_FORM_ENDPOINT, VITE_TURNSTILE_SITE_KEY,
            VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY   (build-time, inlined)
```

### Artefact hashes

```
index-GidAqxzO.js   sha256 e58e88305d1600e076066aaa99f02f6de2e35f69c1474dadfacb649b16f6ee31   354042 B
index-DkfBj9Vw.css  sha256 fbcfb987bc8b5fe1…                                                   93641 B
index.html          sha256 4f718a091fb2a7fc…                                                    2366 B
```

Live bundle fetched from `tellinex.com` after deploy is **byte-identical** to the gated
candidate. The candidate was built twice, in two separate clean worktrees, producing
identical hashes.

### Verification

```
typecheck 0 · release:check PASS (30 mutants) · build 0 · platform-policy PASS · netlify 0
tellinex.com / www / pages.dev / deployment alias  -> all HTTP 200, all index-GidAqxzO.js
DPA 2020 disclosure LIVE · overseas transfer disclosed LIVE
false email promise ABSENT (0) · corrected status wording LIVE
form a11y ids LIVE (availability, contact, register)
sitemap 10 routes incl. /availability and /status
TLS Google Trust Services WE1, valid to 2026-11-06
```

### Known non-green, pre-existing, not a regression

`POST /api/ai-chat` returns `503 service_unavailable`. `functions/api/ai-chat.js` reaches
that branch only when `ANTHROPIC_API_KEY` or `TURNSTILE_SECRET_KEY` is unset. Those Pages
secrets are **not configured**; AI chat was already dead before this deployment and fails
closed by design.

### Rollback

Previous production deployment `0e65d7e2-e61c-4f3a-82df-e86d95c8caf8` (source `967b5eb`,
bundle `index-UaMDS1Hp.js`) remains and can be re-promoted from the Pages dashboard.

### Why the mechanism is interim

Cloudflare Pages **Git integration cannot be configured from the CLI or API** — `wrangler
pages project create` exposes no source options; it requires the dashboard's GitHub App
authorization. Until that is connected, or the workflow in
`.github/workflows/deploy-production.yml` is enabled with a scoped token, production is
still pushed rather than pulled. This deployment is at least *attributable*: its recorded
source SHA is `8312dbf` and the live bytes match a clean build of it.

---

## 2026-09-07 — `db90ee1` — FIRST FULLY AUTOMATED DEPLOYMENT

The first production deployment produced by the pipeline itself rather than by a
person running wrangler. This is the entry that closes deployment-mechanism drift.

| | |
|---|---|
| Repository | `RST1986/tellinex-website` |
| Branch | `main` |
| Commit SHA | `db90ee1ed7d25bcd50aa2b86d65ef35eaed5236d` |
| Workflow run | `34104153457` (`deploy-production.yml`) |
| Pages project | `tellinex-website` |
| Deployment ID | `b98117fd-8e14-4db9-87d3-e2f999024feb` |
| Recorded source | `db90ee1` — equals the GitHub SHA |
| Custom domains | `tellinex.com`, `www.tellinex.com` |
| Mechanism | GitHub Actions, `--commit-hash $GITHUB_SHA`. **No local wrangler session.** |

### Every step executed — none skipped

```
Configuration guard   success    FORM_ENDPOINT contract OK
Install               success
Gates                 success    release:check PASS · 30 mutants killed · AI_CHAT_SECURITY_TESTS=PASS
Build                 success
Deploy                success
Post-deploy proof     success
```

The `FORM_ENDPOINT` contract validation executed in CI for the first time here; on
every prior run the guard exited earlier on a missing value.

### Artefact

```
index-GidAqxzO.js  sha256 e58e88305d1600e076066aaa99f02f6de2e35f69c1474dadfacb649b16f6ee31
```

Identical to the `8312dbf` artefact, which is correct: PR #33 changed only CI,
toolchain pins and documentation — no application code. Cloudflare reported
"Uploaded 0 files (13 already uploaded)", consistent with byte-identical assets.

### Independent verification (not the workflow's self-report)

```
Cloudflare deployment SOURCE = db90ee1                    = GitHub SHA
live tellinex.com bundle sha256 = e58e8830…6ee31          = candidate
DPA disclosure LIVE · withdrawn email promise ABSENT (0)
corrected status wording LIVE · form a11y ids LIVE
sitemap 10 routes incl. /availability
apex 200 · www 200 · TLS Google Trust Services WE1 → 2026-11-06
netlify residuals in live bundle: 0
```

### Rollback

`681faed0-9634-4017-b3c6-8f235a208797` (source `8312dbf`, same bundle) and
`0e65d7e2-e61c-4f3a-82df-e86d95c8caf8` (source `967b5eb`, bundle `index-UaMDS1Hp.js`).

### Still open, unrelated to drift

Pages project secrets `ANTHROPIC_API_KEY` and `TURNSTILE_SECRET_KEY` remain unset, so
`POST /api/ai-chat` returns `503 service_unavailable` and fails closed by design. The only
Pages secret set is `VITE_TURNSTILE_SITE_KEY`, which is a build-time public value and is
inert at the Functions runtime.

---

## Superseded — 2026-08-21 — `967b5eb` (historical, for the record)

Deployment `0e65d7e2`, bundle `index-UaMDS1Hp.js`
sha256 `00637a8d854adaa42e01fa8d50a84f03e1d1abbb1919c99197d773c93a04c51b`.

Built by hand from `/Users/apple/tellinex-website-deploy`. It was **not reproducible** from
its own commit until the missing input was identified: an untracked `.env.production`
holding the four `VITE_*` values. With that file, `967b5eb` rebuilds byte-identically.
Node version and stale `node_modules` were both tested and ruled out as causes.

That folder is **historical evidence only** and is no longer an authorised production
source. It is retained, not deleted.
