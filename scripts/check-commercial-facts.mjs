#!/usr/bin/env node
/**
 * Semantic commercial-truth gate.
 * commercialFacts.ts is inside the protected surface.
 * Primary proof: load production exports and evaluate registry semantics.
 * String scans are secondary defence only.
 */
import fs from "node:fs";
import path from "node:path";
import { loadCommercialFacts, loadTsModule } from "./lib/load-production-module.mjs";

const fail = (message) => {
  console.error(`commercial-facts: FAIL — ${message}`);
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
    if (/\.(tsx|ts|html|js)$/.test(entry.name)) acc.push(full);
  }
  return acc;
};

const read = (file) => fs.readFileSync(file, "utf8");

let facts;
try {
  facts = await loadCommercialFacts();
} catch (error) {
  fail(`commercialFacts.ts failed semantic load: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  facts.assertCommercialRegistryInvariants();
} catch (error) {
  fail(`registry self-assert: ${error instanceof Error ? error.message : String(error)}`);
}

if (facts.LAUNCH_STATE !== "BUILDING_NETWORK") fail("LAUNCH_STATE is not BUILDING_NETWORK");
if (facts.COMMERCIAL_LIVE !== false) fail("COMMERCIAL_LIVE must remain false");
if (facts.PUBLIC_LAUNCH_DATE !== null) fail("PUBLIC_LAUNCH_DATE must not be fabricated");
if (facts.LEGAL_REVIEW_REQUIRED !== true) fail("LEGAL_REVIEW_REQUIRED must remain true");
if (facts.HURRICANE_ABSOLUTE_CLAIMS_ALLOWED !== false) fail("HURRICANE_ABSOLUTE_CLAIMS_ALLOWED silently became true");
if (facts.FIRST_IN_JAMAICA_CLAIM_ALLOWED !== false) fail("FIRST_IN_JAMAICA_CLAIM_ALLOWED silently became true");
if (facts.PRICING_PUBLIC_WORDING !== "PRICING_TO_BE_CONFIRMED") fail("draft pricing became public wording");
if (facts.looksLikePublicPrice(facts.PRICING_PUBLIC_WORDING)) fail("PRICING_PUBLIC_WORDING looks like a price");
if (facts.CURRENT_COVERAGE.class !== "CURRENT_VERIFIED" || facts.CURRENT_COVERAGE.public !== true) {
  fail("CURRENT_COVERAGE lost governed current-verified shape");
}
if (!/not a live national/i.test(facts.CURRENT_COVERAGE.value)) {
  fail("CURRENT_COVERAGE no longer denies live national service");
}
if (facts.looksLikeCurrentNationwideCoverage(facts.CURRENT_COVERAGE.value)) {
  fail("CURRENT_COVERAGE became a nationwide live-service assertion");
}
if (facts.PARISHES_COVERED_CLAIM.public !== false || facts.PARISHES_COVERED_CLAIM.class !== "UNVERIFIED_NOT_PUBLIC") {
  fail("PARISHES_COVERED_CLAIM became public-authoritative");
}
if (facts.DRAFT_RESIDENTIAL_PRICE.public !== false || facts.DRAFT_RESIDENTIAL_PRICE.class !== "DRAFT") {
  fail("DRAFT_RESIDENTIAL_PRICE became public-authoritative");
}
if (facts.NATIONAL_EXPANSION.class !== "PLANNED") fail("planned coverage class drifted from PLANNED");
if (facts.CARIBBEAN_FUTURE_POSITIONING.class !== "VISION") fail("CARIBBEAN_FUTURE_POSITIONING drifted from VISION");
if (facts.JAMAICA_POSITIONING.class !== "CURRENT_VERIFIED") fail("JAMAICA_POSITIONING drifted from CURRENT_VERIFIED");
if (facts.looksLikeInstantServiceOrder(facts.CTA_NAV_LABEL) || facts.looksLikeInstantServiceOrder(facts.CTA_HERO_LABEL)) {
  fail("CTA implies instant service ordering");
}
for (const entry of facts.PUBLIC_SERVICE_CATALOGUE) {
  if (["Residential fibre", "Business fibre", "Enterprise solutions", "Wholesale and backhaul", "On-site contact form"].includes(entry.service) && entry.status === "LIVE") {
    fail(`${entry.service} marked LIVE`);
  }
}
if (facts.NETWORK_DESIGN_PRINCIPLE.class !== "PLANNED") fail("design intent class drifted from PLANNED");
if (facts.PUBLIC_AUTO_HEAL_ENDPOINTS !== 0 || facts.PUBLIC_REDEPLOY_ENDPOINTS !== 0 || facts.PUBLIC_TCC_CONTROL_ENDPOINTS !== 0) {
  fail("public control-plane authority is non-zero");
}

for (const [name, fact] of Object.entries(facts.GOVERNED_STRING_FACTS)) {
  if (!facts.isPublicFact(fact) && fact.public === true) {
    fail(`${name} is ${fact.class} but marked public — cannot be public-authoritative`);
  }
  if (fact.public && fact.class === "CURRENT_VERIFIED") {
    if (facts.looksLikeCurrentNationwideCoverage(fact.value)) fail(`${name} asserts nationwide coverage`);
    if (facts.looksLikeStormAbsoluteAffirmation(fact.value)) fail(`${name} affirms storm-absolute language`);
    if (facts.looksLikePrimacyClaim(fact.value)) fail(`${name} affirms primacy`);
    if (facts.looksLikePublicPrice(fact.value)) fail(`${name} publishes a price`);
  }
}

const FACT_CONSUMERS = {
  CURRENT_COVERAGE: ["src/app/pages/Home.tsx", "src/app/components/NetworkBuildStatus.tsx"],
  NATIONAL_EXPANSION: ["src/app/pages/Home.tsx", "src/app/pages/About.tsx"],
  NETWORK_DESIGN_PRINCIPLE: ["src/app/pages/Home.tsx", "src/app/pages/Services.tsx", "src/app/pages/About.tsx"],
  POSITIONING: ["src/app/pages/Home.tsx", "src/app/pages/About.tsx", "src/app/components/AIChatWidget.tsx"],
  PUBLIC_HEADLINE: ["src/app/pages/Home.tsx"],
  RESILIENCE_PUBLIC_WORDING: ["src/app/pages/Home.tsx", "src/app/components/AIChatWidget.tsx"],
  SYMMETRICAL_SPEED_INTENT: ["src/app/pages/Home.tsx"],
  UPTIME_TARGET: ["src/app/pages/Home.tsx"],
  JAMAICA_POSITIONING: ["src/app/pages/Home.tsx", "src/app/pages/About.tsx", "src/app/components/AIChatWidget.tsx"],
  CARIBBEAN_FUTURE_POSITIONING: ["src/app/pages/About.tsx"],
  CTA_NAV_LABEL: ["src/app/components/Layout.tsx"],
  CTA_HERO_LABEL: ["src/app/pages/Home.tsx"],
  LAUNCH_STATE_PUBLIC_LABEL: ["src/app/pages/Home.tsx", "src/app/components/NetworkBuildStatus.tsx"],
  PUBLIC_SERVICE_CATALOGUE: ["src/app/pages/Services.tsx"],
  PRICING_PUBLIC_WORDING: ["src/app/pages/Services.tsx"],
  LAUNCH_STATE: ["src/app/pages/Home.tsx", "src/app/components/NetworkBuildStatus.tsx", "src/app/components/Layout.tsx"],
  PUBLIC_LAUNCH_DATE: ["src/app/components/NetworkBuildStatus.tsx"],
  PILOT_CORRIDOR: ["src/app/components/NetworkBuildStatus.tsx"],
  COMPANY: ["src/app/pages/Contact.tsx", "src/app/components/Layout.tsx", "src/app/pages/Privacy.tsx"],
  LEGAL_REVIEW_REQUIRED: ["src/app/pages/Privacy.tsx", "src/app/pages/Terms.tsx"],
  REVIEWS_MODE: ["src/app/pages/Reviews.tsx"],
  BIOGRAPHIES: ["src/app/pages/About.tsx"],
};

for (const [factName, files] of Object.entries(FACT_CONSUMERS)) {
  for (const file of files) {
    const text = read(file);
    if (!text.includes("commercialFacts")) fail(`${file} does not import commercialFacts for ${factName}`);
    if (!text.includes(factName)) fail(`${file} does not consume ${factName}`);
  }
}

const home = read("src/app/pages/Home.tsx");
const services = read("src/app/pages/Services.tsx");
const about = read("src/app/pages/About.tsx");
const layout = read("src/app/components/Layout.tsx");
const widget = read("src/app/components/AIChatWidget.tsx");
const index = read("index.html");
const contact = read("src/app/pages/Contact.tsx");
const register = read("src/app/pages/Register.tsx");
const reviews = read("src/app/pages/Reviews.tsx");
const network = read("src/app/components/NetworkBuildStatus.tsx");
const chat = read("functions/api/ai-chat.js");
const systemPrompt = chat.slice(chat.indexOf("const SYSTEM_PROMPT"), chat.indexOf("function isAllowedOrigin"));

if (!home.includes("{PUBLIC_HEADLINE.value}")) fail("Home headline bypasses PUBLIC_HEADLINE");
if (!home.includes("CURRENT_COVERAGE.value")) fail("Home coverage copy bypasses CURRENT_COVERAGE");
if (!services.includes("PRICING_PUBLIC_WORDING") || services.includes("US$")) fail("Services pricing bypasses governed wording");
if (!network.includes("CURRENT_COVERAGE.value")) fail("NetworkBuildStatus bypasses CURRENT_COVERAGE");
if (!layout.includes("{LAUNCH_STATE}")) fail("Layout launch-state copy bypasses registry");
if (layout.includes("Unstoppable") || layout.includes("Unlimited")) fail("Layout contains PR16 storm-absolute wording class");
if (/Get Connected/i.test(layout)) fail("Layout CTA implies instant service ordering");
if (!layout.includes("CTA_NAV_LABEL")) fail("Layout CTA bypasses CTA_NAV_LABEL");
if (!widget.includes("POSITIONING.value") || !widget.includes("RESILIENCE_PUBLIC_WORDING.value")) {
  fail("AI widget welcome text bypasses registry");
}
if (index.includes(facts.SEO.title) === false) fail("index.html title does not match SEO registry");
if (!index.includes(facts.SEO.description)) fail("index.html description does not match SEO registry");
if (!index.includes(facts.SEO.ogTitle)) fail("index.html og:title does not match SEO registry");
if (!index.includes(facts.SEO.ogDescription)) fail("index.html og:description does not match SEO registry");

if (/<form[\s>]/i.test(contact) || /onSubmit/.test(contact) || /setTimeout\s*\(/.test(contact) || /\balert\s*\(/.test(contact)) {
  fail("Contact restored a local success path");
}
if (/Message sent/i.test(contact) || /We'll respond within 24 hours/i.test(contact)) {
  fail("Contact fake-success wording restored");
}
if (!contact.includes("NOT_YET_AVAILABLE")) fail("Contact must remain fail-closed until governed gateway composition");
if (!register.includes("submitPublicForm(\"registration\"")) fail("Register lost gateway submit");
if (!register.includes("REQUEST RECEIVED")) fail("Register success language must be REQUEST RECEIVED");
if (/rest\/v1\/registrations/.test(register)) fail("DIRECT_REGISTRATION_BROWSER_INSERT must be NO");
if (!reviews.includes("sanitizePublicReview")) fail("Reviews must sanitize the public view");

if (!/You are not commercial authority/i.test(systemPrompt)) fail("AI system prompt lost commercial-authority denial");
if (!/cannot invent coverage, pricing, launch dates/i.test(systemPrompt)) fail("AI system prompt lost unsourced-truth denial");
if (/service is live today/i.test(chat) && /status:\s*200/.test(chat.replace(/\s+/g, ""))) {
  fail("AI fail-open live-service wording present");
}

const publicFiles = [
  ...walk("src/app"),
  "index.html",
  "functions/api/ai-chat.js",
].filter((file) => fs.existsSync(file));

const forbiddenPublic = [
  { re: /Hurricane-Proof Internet/i, why: "hurricane absolute" },
  { re: /Category 5/i, why: "storm absolute" },
  { re: /zero storm risk/i, why: "storm absolute" },
  { re: /425K/, why: "unverified homes-passed" },
  { re: /14 parishes covered/i, why: "current coverage claim" },
  { re: /Jamaica's first underground/i, why: "first-in-Jamaica claim" },
  { re: /first in Jamaica/i, why: "first-in-Jamaica claim" },
  { re: /Message sent! We'll respond/i, why: "fake contact success" },
  { re: /CONNECTION ESTABLISHED/, why: "fake activation language" },
  { re: /US\$45\/month/, why: "unapproved public price" },
  { re: /US\$99\/month/, why: "unapproved public price" },
  { re: /From US\$/, why: "unapproved public price" },
  { re: /new Date\("2026-12-31/, why: "fabricated countdown" },
  { re: /Launching April 2026/, why: "unapproved launch date" },
  { re: /Coming 2026/i, why: "unapproved coming-2026 claim" },
  { re: /founding member rates/i, why: "founding-member rate lock" },
  { re: /Get Connected/i, why: "instant-order CTA" },
  { re: /Wi-Fi 6E router included/i, why: "unqualified live entitlement" },
  { re: /24\/7 Jamaican-based support/i, why: "unqualified live entitlement" },
  { re: /priority fault response \(4hr\)/i, why: "unqualified live entitlement" },
  { re: /nationwide scale/i, why: "nationwide-scale credential" },
];

for (const file of publicFiles) {
  const text = read(file);
  const isRegistry = file.includes("commercialFacts.ts");
  for (const rule of forbiddenPublic) {
    if (!rule.re.test(text)) continue;
    if (isRegistry) {
      const publicCurrent = Object.values(facts.GOVERNED_STRING_FACTS).filter(
        (fact) => fact.public && fact.class === "CURRENT_VERIFIED" && rule.re.test(fact.value),
      );
      if (publicCurrent.length > 0) fail(`${file} public CURRENT_VERIFIED value contains ${rule.why}`);
      if (rule.re.test(facts.PRICING_PUBLIC_WORDING)) fail(`${file} PRICING_PUBLIC_WORDING contains ${rule.why}`);
      continue;
    }
    fail(`${file} contains ${rule.why}`);
  }
}

const sitemap = read("public/sitemap.xml");
if (/tellinex.com\/privacy/.test(sitemap)) fail("draft /privacy is sitemap-indexed");
if (/tellinex.com\/terms/.test(sitemap)) fail("draft /terms is sitemap-indexed");
if (fs.existsSync("public/privacy.html")) fail("static privacy.html twin still present");
if (fs.existsSync("public/terms.html")) fail("static terms.html twin still present");

const headers = read("public/_headers");
if (!/\/privacy[\s\S]*X-Robots-Tag:\s*noindex/i.test(headers)) fail("draft /privacy missing noindex header");
if (!/\/terms[\s\S]*X-Robots-Tag:\s*noindex/i.test(headers)) fail("draft /terms missing noindex header");

const pkg = JSON.parse(read("package.json"));
if (!String(pkg.scripts.build).includes("scripts/release-check.mjs")) {
  fail("npm run build does not invoke the commercial/security release gate");
}
if (!String(pkg.scripts.build).includes("vite build")) fail("npm run build lost vite build");
if (String(pkg.scripts["release:check"]).includes("vite build")) fail("release:check must not invoke vite build");
if (pkg.dependencies?.["@netlify/functions"] || pkg.devDependencies?.["@netlify/functions"]) {
  fail("@netlify/functions is unused residual and must be removed");
}

const networkMod = await loadTsModule("src/app/components/NetworkBuildStatus.tsx");
const { createElement } = await import("react");
const { renderToStaticMarkup } = await import("react-dom/server");
const networkHtml = renderToStaticMarkup(createElement(networkMod.default));
if (!networkHtml.includes(facts.CURRENT_COVERAGE.value)) fail("rendered NetworkBuildStatus dropped CURRENT_COVERAGE");
if (facts.looksLikeCurrentNationwideCoverage(networkHtml)) fail("rendered NetworkBuildStatus asserts nationwide coverage");
if (networkHtml.includes("% complete")) fail("rendered NetworkBuildStatus fabricated a completion percentage");

const privacyMod = await loadTsModule("src/app/pages/Privacy.tsx");
const termsMod = await loadTsModule("src/app/pages/Terms.tsx");
const privacyHtml = renderToStaticMarkup(createElement(privacyMod.default));
const termsHtml = renderToStaticMarkup(createElement(termsMod.default));
if (!privacyHtml.includes("LEGAL_REVIEW_REQUIRED=YES")) fail("rendered Privacy lost LEGAL_REVIEW_REQUIRED=YES");
if (!termsHtml.includes("LEGAL_REVIEW_REQUIRED=YES")) fail("rendered Terms lost LEGAL_REVIEW_REQUIRED=YES");
if (privacyHtml.includes("LEGAL_REVIEW_REQUIRED=NO") || termsHtml.includes("LEGAL_REVIEW_REQUIRED=NO")) {
  fail("legal pages rendered LEGAL_REVIEW_REQUIRED=NO");
}

const contactMod = await loadTsModule("src/app/pages/Contact.tsx");
const contactHtml = renderToStaticMarkup(createElement(contactMod.default));
if (!contactHtml.includes("NOT_YET_AVAILABLE")) fail("rendered Contact is not fail-closed");
if (/Message sent/i.test(contactHtml) || /<form/i.test(contactHtml)) fail("rendered Contact restored fake success");

console.log("commercial-facts: PASS");
console.log("COMMERCIAL_FACTS_PROTECTED=YES");
console.log("COMMERCIAL_FACTS_CHECKER_TYPE=SEMANTIC_PRODUCTION_EXPORTS");
console.log("DIRECT_REGISTRATION_BROWSER_INSERT=NO");
console.log("LAUNCH_STATE=BUILDING_NETWORK");
console.log("COMMERCIAL_LIVE=NO");
console.log("LEGAL_REVIEW_REQUIRED=YES");
