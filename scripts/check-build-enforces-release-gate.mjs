#!/usr/bin/env node
import fs from "node:fs";

const fail = (message) => {
  console.error(`build-release-gate: FAIL — ${message}`);
  process.exit(1);
};

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const build = String(pkg.scripts.build || "");
const release = String(pkg.scripts["release:check"] || "");
const releaseSrc = fs.readFileSync("scripts/release-check.mjs", "utf8");
const workflow = fs.existsSync(".github/workflows/commercial-readiness-ci.yml")
  ? fs.readFileSync(".github/workflows/commercial-readiness-ci.yml", "utf8")
  : "";

if (!build.includes("scripts/release-check.mjs")) fail("build does not invoke release-check");
if (!build.includes("vite build")) fail("build does not invoke vite build");
if (build.indexOf("scripts/release-check.mjs") > build.indexOf("vite build")) {
  fail("release-check must run before vite build");
}
if (release.includes("vite build") || release.includes("npm run build")) {
  fail("release:check must not recurse into build");
}
if (/spawnSync\([^\n]*vite/.test(releaseSrc) || /npm run build/.test(releaseSrc)) {
  fail("release-check.mjs must not invoke build");
}
if (!workflow.includes("npm ci") || !workflow.includes("npm run typecheck") || !workflow.includes("npm run release:check") || !workflow.includes("npm run build")) {
  fail("commercial-readiness CI must run npm ci, typecheck, release:check, and build");
}

console.log("build-release-gate: PASS");
console.log("BUILD_ENFORCES_RELEASE_GATE=YES");
console.log("CI_ENFORCES_RELEASE_GATE=YES");
