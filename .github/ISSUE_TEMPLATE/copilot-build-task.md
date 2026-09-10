---
name: Copilot Build Task
about: Bounded source-code task suitable for GitHub Copilot Coding Agent
title: "[Copilot Build] "
labels: []
assignees: []
---

## Objective
Describe one bounded engineering outcome.

## Acceptance criteria
- [ ] Required behaviour is implemented.
- [ ] Applicable tests/checks pass.
- [ ] No unrelated cleanup is included.
- [ ] Security/runtime boundaries are preserved.
- [ ] External assumptions are marked `NEEDS_RUNTIME_VERIFICATION`.

## Scope
List the repository areas, features or files that may be changed.

## Non-goals
State what must not be changed.

## Required proof
List relevant build, test, typecheck, lint, accessibility, security or negative-test gates.

## Escalation triggers
Stop and escalate to Codex/Claude/human review instead of guessing if the task reaches unclear cross-system architecture, subtle authority/security, complex migration/rollback semantics, contradictory governance, destructive operations, or runtime state not provable from source.

## Runtime boundary
`PRODUCTION_MUTATION = NONE`  
`STAGING_MUTATION = NONE`  
`RUNTIME_DEPLOYMENT = NONE`

Do not deploy, mutate live databases, change Cloudflare/DNS/secrets/billing or perform destructive external actions without separate explicit Rui GO.

## PR requirements
State what changed, files/areas touched, checks actually run, runtime effects, remaining verification needs, and safe revert/rollback notes when materially relevant.

Do not automatically request another Copilot review after every push; follow-up review must be deliberate and tied to substantive changes.
