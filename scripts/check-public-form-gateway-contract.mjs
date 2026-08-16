import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const fail = (message) => {
  console.error(`public-form-gateway-contract: FAIL — ${message}`);
  process.exit(1);
};
const requireTokens = (text, tokens, label) => {
  for (const token of tokens) {
    if (!text.includes(token)) fail(`${label} missing ${token}`);
  }
};

const publicForms = read("src/app/lib/publicForms.ts");
const reviews = read("src/app/pages/Reviews.tsx");
const register = read("src/app/pages/Register.tsx");
const packageJson = read("package.json");
const envExample = read(".env.example");

requireTokens(publicForms, [
  "VITE_PUBLIC_FORM_ENDPOINT",
  "DEFAULT_PUBLIC_FORM_ENDPOINT",
  "/functions/v1/submit-public-form",
  "endpoint.protocol !== \"https:\"",
  "endpoint.username !== \"\"",
  "endpoint.password !== \"\"",
  "endpoint.port !== \"\"",
  "endpoint.search !== \"\"",
  "endpoint.hash !== \"\"",
  "SUPABASE_FUNCTION_HOST",
  "export const PUBLIC_FORM_ENDPOINT",
  "WEBSITE_PAGES_PREVIEW_ROOT",
  "tellinex-website.pages.dev",
  "STAGING_FORM_HOST",
  "uygisfwvpcnzuzmrzhqz.supabase.co",
  "isWebsiteBranchPreviewHost",
  "assertPreviewDoesNotUseProductionEndpoint",
], "publicForms.ts");

requireTokens(reviews, [
  "submitPublicForm(\"customer_review\"",
  "action=\"customer_review\"",
], "Reviews.tsx");
requireTokens(register, [
  "submitPublicForm(\"registration\"",
  "action=\"public_registration\"",
], "Register.tsx");
requireTokens(packageJson, [
  "check-public-form-gateway-contract.mjs",
  "check:public-form-gateway",
], "package.json");
requireTokens(envExample, [
  "VITE_PUBLIC_FORM_ENDPOINT=",
  "VITE_TURNSTILE_SITE_KEY=",
], ".env.example");

for (const [label, text] of [["Reviews.tsx", reviews], ["Register.tsx", register]]) {
  if (/rest\/v1\/(customer_reviews|registrations)/.test(text)) {
    fail(`${label} contains a direct public form-table write path`);
  }
}

console.log("public-form-gateway-contract: PASS");
