#!/usr/bin/env node
/**
 * Public website must not host a control plane.
 * PUBLIC_BROWSER_OPUSHEALTH_START=NO
 * PUBLIC_OPUS_DIAGNOSE=NO
 *
 * Fails on:
 * - OpusHealth import/start in public runtime
 * - opus-diagnose Pages Function
 * - browser PATCH to feature_flags / diagnosis_rules
 * - browser write to opus_repair_log
 */
import fs from "node:fs";
import path from "node:path";

const fail = (message) => {
  console.error(`public-control-plane-boundary: FAIL — ${message}`);
  process.exit(1);
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

const BROWSER_EXTS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);

const isBrowserSource = (file) => {
  const rel = file.split(path.sep).join("/");
  if (!rel.startsWith("src/") && !rel.startsWith("src\\")) {
    const normalized = rel.replace(/\\/g, "/");
    if (!normalized.startsWith("src/")) return false;
  }
  return BROWSER_EXTS.has(path.extname(file));
};

const browserFiles = walk("src").filter(isBrowserSource);
const functionFiles = walk("functions");

let failures = 0;
const report = (message) => {
  failures += 1;
  console.error(`public-control-plane-boundary: FAIL — ${message}`);
};

const OPUS_IMPORT =
  /(?:from\s+['"][^'"]*OpusHealth['"]|import\s+OpusHealth\b|require\(\s*['"][^'"]*OpusHealth['"]\s*\))/;
const OPUS_START =
  /new\s+OpusHealth\s*\(|\.start\s*\(|opusHealth\s*\.\s*\w+\s*\.\s*start\s*\(/;

for (const file of browserFiles) {
  const rel = file.split(path.sep).join("/");
  const text = fs.readFileSync(file, "utf8");

  if (OPUS_IMPORT.test(text)) {
    report(`${rel} imports OpusHealth (PUBLIC_BROWSER_OPUSHEALTH_START must be NO)`);
  }
  if (/\bOpusHealth\b/.test(text) && OPUS_START.test(text)) {
    report(`${rel} starts OpusHealth in public runtime`);
  }
  if (/health\.start\s*\(/.test(text) && /OpusHealth/.test(text)) {
    report(`${rel} calls health.start() on OpusHealth`);
  }

  const hasFeatureFlags = /feature_flags/.test(text);
  const hasDiagnosisRules = /diagnosis_rules/.test(text);
  const hasPatch = /method\s*:\s*['"]PATCH['"]/i.test(text) || /\.patch\s*\(/i.test(text);
  const hasPost = /method\s*:\s*['"]POST['"]/i.test(text);

  if (hasFeatureFlags && hasPatch) {
    report(`${rel} contains browser PATCH to feature_flags`);
  }
  if (hasDiagnosisRules && hasPatch) {
    report(`${rel} contains browser PATCH to diagnosis_rules`);
  }
  if (/opus_repair_log/.test(text) && (hasPost || hasPatch || /method\s*:\s*['"]PUT['"]/i.test(text))) {
    report(`${rel} contains browser write to opus_repair_log`);
  }
}

if (fs.existsSync("src/OpusHealth.js") || fs.existsSync("src/OpusHealth.ts")) {
  report("src/OpusHealth.js is retained in the public website tree (delete unused authority-bearing source)");
}

const diagnoseHits = functionFiles.filter((file) => {
  const base = path.basename(file, path.extname(file));
  return base === "opus-diagnose" || file.split(path.sep).join("/").includes("opus-diagnose");
});
if (diagnoseHits.length > 0) {
  report(`public opus-diagnose Pages Function present: ${diagnoseHits.join(", ")} (PUBLIC_OPUS_DIAGNOSE must be NO)`);
}

if (failures > 0) {
  process.exit(1);
}

console.log("public-control-plane-boundary: PASS");
console.log("PUBLIC_BROWSER_OPUSHEALTH_START=NO");
console.log("PUBLIC_OPUS_DIAGNOSE=NO");
console.log("PUBLIC_BROWSER_FEATURE_FLAG_WRITE=NO");
console.log("PUBLIC_BROWSER_DIAGNOSIS_RULE_WRITE=NO");
console.log("PUBLIC_BROWSER_OPUS_REPAIR_LOG_WRITE=NO");
