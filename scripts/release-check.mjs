#!/usr/bin/env node
/**
 * Local release gate. Does NOT deploy.
 * BUILDING_NETWORK, not COMMERCIAL_LIVE.
 * npm script `build` runs this gate first, then the bundler.
 * This file must not spawn the bundler or the npm build script.
 */
import { spawnSync } from "node:child_process";

const steps = [
  ["public-control-plane", "node", ["scripts/check-public-control-plane-boundary.mjs"]],
  ["public-form-gateway", "node", ["scripts/check-public-form-gateway-contract.mjs"]],
  ["chatbot-boundary", "node", ["scripts/check-chatbot-public-form-boundary.mjs"]],
  ["commercial-facts", "node", ["scripts/check-commercial-facts.mjs"]],
  ["secrets-boundary", "node", ["scripts/check-secrets-boundary.mjs"]],
  ["build-release-gate", "node", ["scripts/check-build-enforces-release-gate.mjs"]],
  ["pr16-composition-contract", "node", ["scripts/check-pr16-composition-contract.mjs"]],
  ["sec-control-plane", "node", ["tests/sec-public-control-plane-boundary.mjs"]],
  ["web-commercial", "node", ["tests/web-commercial-readiness.mjs"]],
  ["ai-global-budget", "node", ["tests/ai-global-budget.mjs"]],
  ["r1-r1-semantic", "node", ["tests/r1-r1-semantic-proofs.mjs"]],
];

let failed = 0;
for (const [name, command, args] of steps) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`release:check FAIL — ${name}`);
    failed += 1;
  }
}

if (failed > 0) {
  process.exit(1);
}

console.log("release:check PASS");
console.log("COMMERCIAL_LIVE=NO");
console.log("DEPLOYED=NO");
