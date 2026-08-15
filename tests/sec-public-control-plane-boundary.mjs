#!/usr/bin/env node
/**
 * SEC1–SEC8: public website is not a Tellinex control plane.
 * Run: node tests/sec-public-control-plane-boundary.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const fail = (id, message) => {
  console.error(`${id}: FAIL — ${message}`);
  process.exit(1);
};

const pass = (id, detail) => {
  console.log(`${id}: PASS — ${detail}`);
};

const walk = (dir, acc = []) => {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      walk(full, acc);
      continue;
    }
    acc.push(full);
  }
  return acc;
};

const read = (file) => fs.readFileSync(file, "utf8");
const browserFiles = walk("src").filter((file) =>
  [".js", ".jsx", ".ts", ".tsx", ".mjs"].includes(path.extname(file)),
);
const browserBundle = browserFiles.map((file) => `${file}\n${read(file)}`).join("\n");
const main = read("src/main.tsx");

// SEC1 — OpusHealth is not imported or started in the public entrypoint.
if (/OpusHealth/.test(main) || /opusHealth/.test(main) || /health\.start\s*\(/.test(main)) {
  fail("SEC1", "src/main.tsx still references OpusHealth or starts a health agent");
}
pass("SEC1", "PUBLIC_BROWSER_OPUSHEALTH_START=NO");

// SEC2 — Authority-bearing OpusHealth source is not shipped in the public tree.
if (fs.existsSync("src/OpusHealth.js") || fs.existsSync("src/OpusHealth.ts") || fs.existsSync("src/OpusHealth.d.ts")) {
  fail("SEC2", "OpusHealth source/types still present under src/");
}
pass("SEC2", "unused authority-bearing OpusHealth source deleted");

// SEC3 — Public opus-diagnose Pages Function is absent.
const diagnose = walk("functions").filter((file) => file.includes("opus-diagnose"));
if (diagnose.length > 0) {
  fail("SEC3", `PUBLIC_OPUS_DIAGNOSE still present: ${diagnose.join(", ")}`);
}
pass("SEC3", "PUBLIC_OPUS_DIAGNOSE=NO");

// SEC4 — Browser must not PATCH feature_flags.
if (/feature_flags/.test(browserBundle) && /method\s*:\s*['"]PATCH['"]/.test(browserBundle)) {
  fail("SEC4", "browser source PATCHes feature_flags");
}
pass("SEC4", "PUBLIC_BROWSER_FEATURE_FLAG_WRITE=NO");

// SEC5 — Browser must not PATCH diagnosis_rules.
if (/diagnosis_rules/.test(browserBundle) && /method\s*:\s*['"]PATCH['"]/.test(browserBundle)) {
  fail("SEC5", "browser source PATCHes diagnosis_rules");
}
pass("SEC5", "PUBLIC_BROWSER_DIAGNOSIS_RULE_WRITE=NO");

// SEC6 — Browser must not write opus_repair_log, app_heartbeats, crash_reports, opus_events.
for (const table of ["opus_repair_log", "app_heartbeats", "crash_reports", "opus_events"]) {
  if (new RegExp(table).test(browserBundle)) {
    fail("SEC6", `browser source still references ${table}`);
  }
}
pass("SEC6", "no public-browser writes to control-plane tables");

// SEC7 — No public redeploy / auto-disable / fail-open unknown-feature authority.
if (/triggerNetlifyRedeploy|api\.netlify\.com\/api\/v1\/sites/.test(browserBundle)) {
  fail("SEC7", "browser source contains Netlify redeploy control path");
}
if (/auto_disabled_feature|disabled_by:\s*['"]opus_health_auto['"]/.test(browserBundle)) {
  fail("SEC7", "browser source still auto-disables features");
}
if (/Unknown features default to enabled|if\s*\(\s*!flag\s*\)\s*return\s+true/.test(browserBundle)) {
  fail("SEC7", "fail-open unknown-feature→enabled remains in public runtime");
}
const publicFunctions = walk("functions").map((file) => read(file)).join("\n");
if (/triggerNetlifyRedeploy|api\.netlify\.com\/api\/v1\/sites/.test(publicFunctions)) {
  fail("SEC7", "Pages Functions still contain Netlify redeploy control path");
}
pass("SEC7", "PUBLIC_REDEPLOY_CAPABILITY=NO; PUBLIC_BROWSER_AUTO_DISABLE=NO; fail-open removed");

// SEC8 — Guardian cron is not a public-website deployable control plane.
const guardianExists = fs.existsSync("workers/opus-guardian-cron/index.js");
if (guardianExists) {
  const guardian = read("workers/opus-guardian-cron/index.js");
  if (!/MUST_MIGRATE_TO_TCC_PRIVATE_CONTROL_PLANE/.test(guardian)) {
    fail("SEC8", "guardian cron retained without MUST_MIGRATE_TO_TCC_PRIVATE_CONTROL_PLANE");
  }
  if (!/INTERNAL_NOT_FOR_PUBLIC_RUNTIME/.test(guardian)) {
    fail("SEC8", "guardian cron retained without INTERNAL_NOT_FOR_PUBLIC_RUNTIME");
  }
  pass("SEC8", "guardian cron retained only as MUST_MIGRATE_TO_TCC_PRIVATE_CONTROL_PLANE");
} else {
  pass("SEC8", "guardian cron removed from public website repo; MUST_MIGRATE_TO_TCC_PRIVATE_CONTROL_PLANE");
}

const check = spawnSync(process.execPath, ["scripts/check-public-control-plane-boundary.mjs"], {
  encoding: "utf8",
});
if (check.status !== 0) {
  fail("BOUNDARY_CHECK", check.stderr || check.stdout || "checker exited non-zero");
}
pass("BOUNDARY_CHECK", "scripts/check-public-control-plane-boundary.mjs");

console.log("SEC_TESTS=PASS");
