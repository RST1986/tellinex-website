# Tellinex Website — Copilot build instructions

GitHub Copilot is a bounded source-code builder and reviewer for this repository. It is not an autonomous production or Cloudflare operator.

## Delivery lane

`issue -> bounded build -> tests/evidence -> PR -> one meaningful AI review -> specialist escalation if needed -> human GO for high-impact runtime operations`

## Build scope

Copilot may implement well-scoped repository-local work including:

- website UI and component changes;
- accessibility, responsive design and performance improvements;
- SEO/metadata and content-structure corrections;
- forms, validation, routing and error handling;
- tests, type safety and regression coverage;
- dependency and CI improvements;
- source-only Cloudflare configuration improvements when no runtime change is performed;
- removal of stale or dead source configuration when evidence is clear.

Do not broaden a bounded issue into unrelated cleanup.

## Tellinex website rules

- Cloudflare is the active deployment platform. Do not introduce or restore Netlify deployment dependencies or links.
- Repository state does not prove live Cloudflare, DNS, domain, binding, environment-variable or production state. Mark unverified runtime claims `NEEDS_CLOUDFLARE_RUNTIME_VERIFICATION`.
- Never fabricate successful deployments, production health, DNS status, analytics results or external integrations.
- Preserve existing security headers, CSP, input-validation and browser-security boundaries unless the task explicitly and safely improves them.
- Keep secrets and privileged provider credentials server-side.

## Escalate instead of guessing

Escalate to Codex/Claude/human engineering review for cross-system architecture, subtle authentication or tenant boundaries, complex edge/security behaviour, contradictory governance evidence, destructive operations, or runtime state that cannot be proved from source.

## Human GO boundary

Without separate explicit Rui GO, do not:

- deploy to production/staging;
- mutate Cloudflare Pages/Workers, DNS, domains, bindings or environment variables;
- create, rotate or delete secrets;
- change billing/subscriptions/budgets;
- mutate Supabase or production data;
- perform destructive external-system actions.

Source, tests, runbooks and readiness evidence for those operations may be prepared when the issue explicitly says source-only.

## Testing and evidence

Every implementation PR should state scope/non-goals, files changed, checks actually run, runtime effects, remaining verification needs and safe-revert notes where material. Never report a test or deployment as successful unless authoritative evidence exists.

## AI cost control

- Do not request a new automatic Copilot review on every `synchronize`/push.
- Automatic review belongs at `opened`, `reopened` and `ready_for_review` lifecycle boundaries.
- Re-request review manually only after substantive remediation.
- Prefer one bounded agent task over repeated broad prompts.

## Pull requests

Work on a branch, respect repository checks and never merge solely because an AI review is green.

Default boundary:

`PRODUCTION_MUTATION = NONE`
`STAGING_MUTATION = NONE`
`RUNTIME_DEPLOYMENT = NONE`
