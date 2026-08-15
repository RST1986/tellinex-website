#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const fail = (message) => {
  console.error(`secrets-boundary: FAIL — ${message}`);
  process.exit(1);
};

const walk = (dir, acc = []) => {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", "dist", ".git"].includes(entry.name)) continue;
      walk(full, acc);
      continue;
    }
    acc.push(full);
  }
  return acc;
};

const browserFiles = walk("src").filter((file) => /\.(ts|tsx|js|jsx)$/.test(file));
const bundle = browserFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");

if (/service_role/.test(bundle)) fail("SERVICE_ROLE_IN_BROWSER must be NO");
if (/ANTHROPIC_API_KEY/.test(bundle)) fail("PRIVATE_AI_KEY_IN_BROWSER must be NO");
if (/TURNSTILE_SECRET_KEY/.test(bundle)) fail("TURNSTILE_SECRET_IN_BROWSER must be NO");
if (/OPUS_NETLIFY_TOKEN/.test(bundle)) fail("NETLIFY_TOKEN_IN_BROWSER must be NO");
if (/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(bundle)) {
  fail("Hardcoded JWT-like secret in browser source");
}

console.log("secrets-boundary: PASS");
console.log("SERVICE_ROLE_IN_BROWSER=NO");
console.log("PRIVATE_AI_KEY_IN_BROWSER=NO");
