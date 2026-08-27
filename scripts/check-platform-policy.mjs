#!/usr/bin/env node
/**
 * TELLINEX_PLATFORM_POLICY gate — Cloudflare-only web runtime.
 *
 *   web_runtime:                    CLOUDFLARE_ONLY
 *   netlify_operational_capability: FORBIDDEN
 *
 * Netlify is a cancelled, prohibited operational platform across the Tellinex
 * ecosystem. This is an architectural policy, not a temporary migration state.
 *
 * The pre-existing security guards (scripts/check-secrets-boundary.mjs and
 * tests/sec-public-control-plane-boundary.mjs) assert the *specific historical*
 * Netlify vectors (OPUS_NETLIFY_TOKEN in browser source; the
 * triggerNetlifyRedeploy / api.netlify.com/api/v1/sites control path). They do
 * NOT stop a *general* reintroduction — a new @netlify/* dependency, a
 * `netlify deploy` CI step, or a bare api.netlify.com build hook would pass
 * them. This gate enforces the policy by CATEGORY, not by one literal
 * identifier, so the capability cannot return under a new name.
 *
 * FALSE-POSITIVE CONTROL (this is the whole point of a policy gate):
 *   - Historical documentation under docs/ is NOT scanned.
 *   - The negative security guards that legitimately contain forbidden strings
 *     as assertions ("fail if api.netlify.com appears") are allow-listed below
 *     and NOT scanned — they describe the forbidden capability, they don't
 *     invoke it. Removing those guards is prohibited; this gate never flags
 *     them.
 *   - A Cloudflare-only change (no Netlify capability) is never flagged.
 *
 * Run: node scripts/check-platform-policy.mjs   (also invoked by release:check)
 * No network, no deploy, no credentials. Source/manifest inspection only.
 */
import fs from "node:fs";
import path from "node:path";

const findings = [];
const record = (category, where, detail) => findings.push({ category, where, detail });

// ---------------------------------------------------------------------------
// Negative-guard allow-list: files that legitimately contain forbidden Netlify
// strings *as forbidden-string assertions*. Adding a file here is a deliberate,
// reviewable act. Verified against `git grep` for capability tokens on main.
// ---------------------------------------------------------------------------
const NEGATIVE_GUARD_ALLOWLIST = new Set([
  "scripts/check-secrets-boundary.mjs",       // asserts OPUS_NETLIFY_TOKEN absent from browser src
  "tests/sec-public-control-plane-boundary.mjs", // SEC7: asserts the redeploy control path is absent
  "scripts/check-platform-policy.mjs",        // this file (self)
]);

// Directories never treated as operational runtime surface.
const SKIP_DIRS = new Set([
  "node_modules", "dist", ".git", ".wrangler-pages-functions-check",
  "docs", // historical documentation / migration records — explicitly out of scope
]);

const rel = (p) => path.relative(process.cwd(), p).split(path.sep).join("/");

const walk = (dir, acc = []) => {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), acc);
      continue;
    }
    acc.push(path.join(dir, entry.name));
  }
  return acc;
};

// ---------------------------------------------------------------------------
// Category patterns — behaviour classes, not one historical string.
// ---------------------------------------------------------------------------
const PATTERNS = [
  ["FORBIDDEN RUNTIME HOST/API", /\bapi\.netlify\.com\b|\bapp\.netlify\.com\b|[a-z0-9-]+\.netlify\.app\b|netlify\.com\/build_hooks/i],
  ["FORBIDDEN ENV SECRET", /\bOPUS_NETLIFY_TOKEN\b|\bNETLIFY_AUTH_TOKEN\b|\bNETLIFY_TOKEN\b|\bNETLIFY_SITE_ID\b/],
  ["FORBIDDEN DEPLOY COMMAND", /\bnetlify\s+deploy\b|\bnetlify\s+functions\b|\bnetlify-cli\b|nwtgck\/actions-netlify|netlify\/actions/i],
  ["FORBIDDEN REDEPLOY HOOK", /triggerNetlifyRedeploy|netlify[^\n]{0,40}redeploy/i],
  ["FORBIDDEN DEPENDENCY (import)", /['"]@netlify\/[a-z0-9-]+['"]|require\(\s*['"]@netlify\//i],
];

// Operational surfaces: runtime, functions, workers, build/CI scripts, and the
// full .github tree (workflows AND local/composite actions). A deploy command
// can also live in package.json "scripts", root shell/build scripts, or a
// Makefile/Dockerfile — a functions+workflows-only scan would miss those, so
// they are scanned as text here. package.json / package-lock.json ALSO get a
// structured dependency pass below.
const roots = ["src", "functions", "workers", "scripts", "tests", ".github"];
const rootFiles = [
  "package.json",
  "wrangler.toml", "wrangler.jsonc", "wrangler.json",
  "vite.config.ts", "vite.config.js", "tsconfig.json",
  "Makefile", "Dockerfile", "Procfile",
];
// Any shell/deploy script sitting at the repo root is a deploy-command surface too.
for (const name of fs.readdirSync(".")) {
  try {
    if (/\.(sh|bash|zsh|mjs|cjs)$/.test(name) && fs.statSync(name).isFile()) rootFiles.push(name);
  } catch { /* ignore unreadable entries */ }
}

const operationalFiles = [
  ...roots.flatMap((r) => walk(r)),
  ...[...new Set(rootFiles)].filter((f) => fs.existsSync(f)).map((f) => path.resolve(f)),
].filter((f) => !NEGATIVE_GUARD_ALLOWLIST.has(rel(f)));

for (const file of operationalFiles) {
  let text;
  try { text = fs.readFileSync(file, "utf8"); } catch { continue; }
  for (const [category, re] of PATTERNS) {
    if (re.test(text)) record(category, rel(file), `matched ${re}`);
  }
}

// ---------------------------------------------------------------------------
// Dependency manifests — structured scan (a source-text scan misses these).
// ---------------------------------------------------------------------------
if (fs.existsSync("package.json")) {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  for (const field of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
    for (const name of Object.keys(pkg[field] || {})) {
      if (/^@netlify\//.test(name) || /^netlify(-cli|-lambda)?$/.test(name)) {
        record("FORBIDDEN DEPENDENCY", `package.json:${field}`, name);
      }
    }
  }
}
if (fs.existsSync("package-lock.json")) {
  const lock = fs.readFileSync("package-lock.json", "utf8");
  if (/"node_modules\/@netlify\/|"@netlify\/[a-z0-9-]+"\s*:/.test(lock)) {
    record("FORBIDDEN DEPENDENCY", "package-lock.json", "@netlify/* present in lockfile tree");
  }
}

// ---------------------------------------------------------------------------
// Forbidden Netlify configuration files / serverless runtime directories.
// ---------------------------------------------------------------------------
for (const p of ["netlify.toml", "netlify", ".netlify"]) {
  if (fs.existsSync(p)) record("FORBIDDEN NETLIFY CONFIG/RUNTIME", p, "path exists");
}

// ---------------------------------------------------------------------------
// Verdict.
// ---------------------------------------------------------------------------
if (findings.length > 0) {
  console.error("platform-policy: FAIL — prohibited Netlify operational capability detected");
  console.error("TELLINEX_PLATFORM_POLICY=CLOUDFLARE_ONLY  NETLIFY_OPERATIONAL_CAPABILITY=FORBIDDEN");
  for (const f of findings) {
    console.error(`  ${f.category}: ${f.where} — ${f.detail}`);
  }
  process.exit(1);
}

console.log("platform-policy: PASS");
console.log("TELLINEX_PLATFORM_POLICY=CLOUDFLARE_ONLY");
console.log("NETLIFY_OPERATIONAL_CAPABILITY=FORBIDDEN");
console.log("NETLIFY_DEPENDENCY=NO");
console.log("NETLIFY_ENV_SECRET=NO");
console.log("NETLIFY_DEPLOY_COMMAND=NO");
console.log("NETLIFY_RUNTIME_HOST=NO");
console.log("NETLIFY_CONFIG_FILE=NO");
console.log("CLOUDFLARE_ONLY=YES");
