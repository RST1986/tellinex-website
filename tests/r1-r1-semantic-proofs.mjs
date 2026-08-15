#!/usr/bin/env node
import fs from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadCommercialFacts, loadTsModule } from "../scripts/lib/load-production-module.mjs";

const fail = (id, message) => {
  console.error(`${id}: FAIL — ${message}`);
  process.exit(1);
};
const pass = (id, detail) => console.log(`${id}: PASS — ${detail}`);
const read = (file) => fs.readFileSync(file, "utf8");

const facts = await loadCommercialFacts();
facts.assertCommercialRegistryInvariants();
pass("R1", "commercialFacts registry loaded and self-asserted as a protected semantic surface");

if (facts.looksLikeCurrentNationwideCoverage(facts.CURRENT_COVERAGE.value)) fail("R2", "false CURRENT_COVERAGE present");
pass("R2", "CURRENT_COVERAGE cannot assert nationwide live service");

if (facts.PARISHES_COVERED_CLAIM.public !== false || facts.PARISHES_COVERED_CLAIM.class !== "UNVERIFIED_NOT_PUBLIC") {
  fail("R3", "parish claim is public/current");
}
pass("R3", "PARISHES_COVERED_CLAIM remains UNVERIFIED_NOT_PUBLIC");

if (facts.DRAFT_RESIDENTIAL_PRICE.public !== false || facts.PRICING_PUBLIC_WORDING !== "PRICING_TO_BE_CONFIRMED") {
  fail("R4", "draft price became public");
}
pass("R4", "draft residential price cannot become public contractual truth");

if (facts.HURRICANE_ABSOLUTE_CLAIMS_ALLOWED !== false) fail("R5", "storm-absolute flag true");
pass("R5", "HURRICANE_ABSOLUTE_CLAIMS_ALLOWED remains false");

if (facts.FIRST_IN_JAMAICA_CLAIM_ALLOWED !== false) fail("R6", "first/only flag true");
pass("R6", "FIRST_IN_JAMAICA_CLAIM_ALLOWED remains false");

const contactHtml = renderToStaticMarkup(createElement((await loadTsModule("src/app/pages/Contact.tsx")).default));
if (!contactHtml.includes("NOT_YET_AVAILABLE") || /Message sent/i.test(contactHtml) || /<form/i.test(contactHtml)) {
  fail("R7", "Contact fake success restored");
}
if (/setTimeout\s*\(|\balert\s*\(|onSubmit/.test(read("src/app/pages/Contact.tsx"))) {
  fail("R7", "Contact fake local success restored");
}
pass("R7", "Contact fake-success path is absent from source and render");

const chat = read("functions/api/ai-chat.js");
if (!/You are not commercial authority/.test(chat) || /service is live today/i.test(chat)) {
  fail("R8", "AI commercial-authority mutant class present");
}
pass("R8", "AI cannot invent commercial authority or fail-open as live");

if (!read("src/app/pages/Home.tsx").includes("{PUBLIC_HEADLINE.value}") || !read("src/app/pages/Services.tsx").includes("PRICING_PUBLIC_WORDING")) {
  fail("R9", "production consumers bypass the registry");
}
pass("R9", "Home/Services/Layout/NetworkBuildStatus consume the registry");

const pkg = JSON.parse(read("package.json"));
if (!String(pkg.scripts.build).includes("scripts/release-check.mjs")) fail("R10", "build bypasses truth gates");
pass("R10", "npm run build invokes release-check before vite build");

const workflow = read(".github/workflows/commercial-readiness-ci.yml");
if (!workflow.includes("npm run release:check") || !workflow.includes("npm run build")) fail("R11", "CI bypasses truth gates");
pass("R11", "commercial-readiness CI invokes release:check and build");

if (!chat.includes("decideGlobalBudget") || !fs.existsSync("functions/_lib/ai-global-budget.js")) {
  fail("R12", "global budget contract missing");
}
pass("R12", "source contract requires global budget authority before upstream AI");

if (!read("functions/_lib/ai-global-budget.js").includes("global_budget_denied")) fail("R13", "deny path missing");
pass("R13", "global budget deny code exists in the production contract");

if (!chat.includes("PER_ISOLATE_SUPPLEMENTAL_ONLY")) fail("R14", "Maps are not classified as per-isolate supplemental");
if (/const (globalRequestCounts|globalTokenSpend|companyWideBreaker)/.test(chat)) {
  fail("R14", "isolate Maps named as global authority");
}
pass("R14", "per-isolate Maps are classified supplemental, not global authority");

const sitemap = read("public/sitemap.xml");
if (/tellinex.com\/privacy/.test(sitemap)) fail("R15", "privacy still in sitemap");
pass("R15", "privacy absent from sitemap while legal draft");

if (/tellinex.com\/terms/.test(sitemap)) fail("R16", "terms still in sitemap");
pass("R16", "terms absent from sitemap while legal draft");

const headers = read("public/_headers");
if (!/\/privacy[\s\S]*X-Robots-Tag:\s*noindex/i.test(headers)) fail("R17", "privacy not noindex");
if (!/\/terms[\s\S]*X-Robots-Tag:\s*noindex/i.test(headers)) fail("R17", "terms not noindex");
if (!read("src/app/pages/Privacy.tsx").includes("useDraftLegalRobots") || !read("src/app/pages/Terms.tsx").includes("useDraftLegalRobots")) {
  fail("R17", "SPA legal routes lost draft robots handling");
}
pass("R17", "draft legal routes noindex via headers and SPA robots hook");

if (fs.existsSync("public/privacy.html") || fs.existsSync("public/terms.html")) fail("R18", "static legal twins remain");
pass("R18", "no divergent static legal-content twin");

if (pkg.dependencies?.["@netlify/functions"] || pkg.devDependencies?.["@netlify/functions"]) {
  fail("R19", "@netlify/functions still declared");
}
if (read("package-lock.json").includes("\"node_modules/@netlify/functions\"")) {
  fail("R19", "@netlify/functions still in lockfile");
}
pass("R19", "@netlify/functions unused residual removed");

const fixture = JSON.parse(read("tests/fixtures/pr16-composition-rejection.json"));
if (!fixture.forbidden_layout_wording[0].includes("Unstoppable")) fail("R20", "PR16 wording fixture missing");
if (read("src/app/components/Layout.tsx").includes("Unstoppable")) fail("R20", "Unstoppable wording present");
pass("R20", "PR16 Unstoppable/storm wording captured as future composition rejection");
