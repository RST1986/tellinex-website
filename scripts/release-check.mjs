#!/usr/bin/env node
/**
 * Local release gate. Does NOT deploy.
 * BUILDING_NETWORK, not COMMERCIAL_LIVE.
 */
import { spawnSync } from "node:child_process";

const steps = [
  ["public-control-plane", "node", ["scripts/check-public-control-plane-boundary.mjs"]],
  ["public-form-gateway", "node", ["scripts/check-public-form-gateway-contract.mjs"]],
  ["public-form-callers", "node", ["scripts/check-public-form-callers-contract.mjs"]],
  ["chatbot-boundary", "node", ["scripts/check-chatbot-public-form-boundary.mjs"]],
  ["commercial-facts", "node", ["scripts/check-commercial-facts.mjs"]],
  ["secrets-boundary", "node", ["scripts/check-secrets-boundary.mjs"]],
  ["security-headers", "node", ["scripts/check-security-headers.mjs"]],
  ["sec-control-plane", "node", ["tests/sec-public-control-plane-boundary.mjs"]],
  ["web-commercial", "node", ["tests/web-commercial-readiness.mjs"]],
  ["ai-chat-boundary", "node", ["tests/sec-ai-chat-boundary.mjs"]],
  ["commercial-mutants", "node", ["scripts/kill-commercial-readiness-mutants.mjs"]],
  ["control-plane-mutants", "node", ["scripts/kill-public-control-plane-mutants.mjs"]],
  ["ai-chat-mutants", "node", ["scripts/kill-ai-chat-mutants.mjs"]],
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
console.log("AI_CHAT_DURABLE_ABUSE_CONTROL=BLOCKED_INFRA_GATE");
