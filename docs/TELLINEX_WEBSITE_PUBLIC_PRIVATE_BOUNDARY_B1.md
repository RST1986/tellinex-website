# Tellinex website public/private boundary (B1)

PUBLIC WEBSITE != CONTROL PLANE.
PUBLIC BY EXCEPTION. PRIVATE BY DEFAULT.
The browser must never change Tellinex operational authority.

This batch is `TELLINEX-WEBSITE-P0-SECURITY-BOUNDARY-B1`.
It does not complete commercial readiness. Independent assurance is still required.

## Classification — `OpusHealth.js` (removed)

Historical source `src/OpusHealth.js` was a public-runtime operational agent.
It is deleted from this repository. Classification of what it did:

| Capability | Class | Why |
|---|---|---|
| Hardcoded Supabase anon key + REST client | `UNSAFE_PUBLIC` | Secret-equivalent credential in the public bundle |
| `start()` / singleton `opusHealth.{tcc,preview,landing,portal,fieldpack}` | `CONTROL_PLANE` / `AUTHORITY` | Starts an operational agent in the visitor browser, including TCC and FieldPack identities |
| `loadFlags()` GET `feature_flags` | `CONTROL_PLANE` | Reads operational feature authority |
| `loadRules()` GET `diagnosis_rules` | `CONTROL_PLANE` | Loads auto-heal rules |
| `isEnabled()` unknown feature → `true` | `UNSAFE_PUBLIC` / `AUTHORITY` | Fail-open is unacceptable |
| `heartbeat()` POST `app_heartbeats` | `CONTROL_PLANE` | Public browser writes operational telemetry |
| `reportCrash()` POST `crash_reports` | `CONTROL_PLANE` | Public browser writes ops records and can trigger auto-disable |
| `diagnose()` PATCH `diagnosis_rules` | `AUTHORITY` | Public browser mutates diagnosis-rule counters |
| `disableFeature()` PATCH `feature_flags` + POST `opus_repair_log` | `AUTHORITY` | Public browser disables product features globally |
| `executeAutoFix()` reload / cache wipe | `LOCAL_ONLY` mixed with `AUTHORITY` | Local side effects; remote disable remains authority |
| `stop()` | `LOCAL_ONLY` | Interval cleanup only |

`PUBLIC_BROWSER_OPUSHEALTH_START=NO`. No replacement operational agent is added.

Fail-open unknown-feature→enabled is gone because the source is deleted, not because it was switched to fail-closed in public runtime.

## Public runtime

`src/main.tsx` no longer imports or starts OpusHealth.
There is no public-browser write path to:

- `feature_flags`
- `diagnosis_rules`
- `app_heartbeats`
- `crash_reports`
- `opus_repair_log`
- `opus_events`

Legitimate public customer-intake (`src/app/lib/publicForms.ts` → `submit-public-form`) is unchanged.
Public chatbot (`functions/api/ai-chat.js`) is unchanged.

## `opus-diagnose`

`functions/opus-diagnose.js` is removed.
`PUBLIC_OPUS_DIAGNOSE=NO`.

This is not a CORS lock, not a secret-query gate, and not a hidden UI.
The public Pages Function is gone. It previously:

- accepted unauthenticated POST with `Access-Control-Allow-Origin: *`
- auto-healed by triggering Netlify redeploys
- wrote `opus_events`
- called Anthropic
- sent WhatsApp alerts

Those are private control-plane actions. They belong in TCC, not on the public website.

## Guardian cron

`workers/opus-guardian-cron/` is removed from this public website repository.

Status: **removed as obsolete and unsafe to keep deployable beside the public site**.
It still targeted Netlify Build API URLs and could redeploy production properties.

`MUST_MIGRATE_TO_TCC_PRIVATE_CONTROL_PLANE=YES`.
Do not deploy a replacement from this repo. No new infra is created here.

## Legacy Netlify control paths

Removed from in-scope files:

- `functions/opus-diagnose.js` `triggerNetlifyRedeploy`
- `workers/opus-guardian-cron/index.js` `triggerRedeploy` / `OPUS_NETLIFY_TOKEN`

`package.json` listed `@netlify/functions` at P0 time. R1-R1 removed that unused residual.
`DEFERRED_TO_COMPOSITION` applied to P0; it is not a reason to keep a dead dependency after R1-R1.

## Enforcement

- `node scripts/check-public-control-plane-boundary.mjs`
- `node tests/sec-public-control-plane-boundary.mjs` (SEC1–SEC8)

`package.json` is not modified in the P0 batch (`PACKAGE_INTEGRATION_DEFERRED_TO_PR16_COMPOSITION=YES` at that time). R1-R1 later removed unused `@netlify/functions`.

## Non-goals

- No merge, no deploy, no Cloudflare/DNS/Supabase remote mutation
- No production or staging write
- Independent assurance is **not** performed here (`CLAUDE_INDEPENDENT_ASSURANCE_REQUIRED=YES`)
