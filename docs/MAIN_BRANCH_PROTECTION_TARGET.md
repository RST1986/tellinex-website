# Website `main` branch protection target

## Observed baseline

- Repository: `RST1986/tellinex-website`
- Baseline main SHA: `ed35ae6c9641f80b50dd8b269df411cc3ae16e7d`
- GitHub branch readback reports `protected=false` and required status-check enforcement off.
- The production deployment workflow is automated and verified, but deployment provenance is not a substitute for source-branch enforcement.

## Stable required checks

The Website has two suitable deterministic PR gates:

1. `verify` — Website CI: TypeScript, production build/public-form contracts, `release:check`, and Pages Functions compile without deployment.
2. `boundary` — UI Registry/TXS/adoption/AI/legal/canvas/bespoke-regression boundary.

Wave 16 removes the path filter from `boundary` so it exists for every pull request targeting `main`. A required check must not disappear on a non-UI patch.

Do **not** make `Deploy production` a pull-request required check: it intentionally runs only after a push to `main` and is a post-merge production action, not a pre-merge gate.

## Target branch policy

Configure GitHub branch protection or an equivalent ruleset so that:

- normal engineering changes reach `main` only through pull requests;
- required checks are `verify` and `boundary`;
- required checks must be current against the target branch before merge;
- force pushes are blocked;
- branch deletion is blocked;
- unresolved review conversations block merge where review conversations exist;
- administrative bypass is limited to explicit recovery use, not normal delivery.

For the current single-owner model, do not invent an independent human-approval count that cannot be genuinely satisfied. Add mandatory independent approval when a second maintainer/reviewer exists.

## Evidence rules

- `CI_CHECKS_PRESENT=YES` does not mean `MAIN_PROTECTED=YES`.
- `DEPLOY_PROVEN=YES` does not mean `MAIN_PROTECTED=YES`.
- Merging Wave 16 will not itself prove provider-side enforcement.
- Only direct GitHub readback plus a negative merge-block test may set `MAIN_PROTECTED=YES`.

## Activation proof sequence

1. Merge Wave 16 only when the corresponding production deploy from the `main` push is intended.
2. Configure branch protection/ruleset with required checks `verify` and `boundary`.
3. Read back the provider state directly from GitHub.
4. Open a disposable governance test PR with a deliberately failing required check and prove merge is blocked.
5. Restore the test branch to green and prove the normal governed merge path is available.
6. Update the controlled Google Drive state only after provider readback and negative proof exist.
