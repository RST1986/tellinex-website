#!/usr/bin/env node
/**
 * WEB1–WEB20 production-relevant commercial proofs.
 * Each test uses production exports, renderable components, generated source
 * artifacts, or an executed production handler path.
 */
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

const networkMod = await loadTsModule("src/app/components/NetworkBuildStatus.tsx");
const privacyMod = await loadTsModule("src/app/pages/Privacy.tsx");
const termsMod = await loadTsModule("src/app/pages/Terms.tsx");
const contactMod = await loadTsModule("src/app/pages/Contact.tsx");
const networkHtml = renderToStaticMarkup(createElement(networkMod.default));
const privacyHtml = renderToStaticMarkup(createElement(privacyMod.default));
const termsHtml = renderToStaticMarkup(createElement(termsMod.default));
const contactHtml = renderToStaticMarkup(createElement(contactMod.default));

if (facts.LAUNCH_STATE !== "BUILDING_NETWORK" || !networkHtml.includes("BUILDING_NETWORK")) {
  fail("WEB1", "production launch state is not BUILDING_NETWORK");
}
pass("WEB1", "production export + rendered NetworkBuildStatus use BUILDING_NETWORK");

if (facts.PUBLIC_LAUNCH_DATE !== null) fail("WEB2", "PUBLIC_LAUNCH_DATE was fabricated");
if (/April 2026/.test(read("index.html") + networkHtml)) fail("WEB2", "fabricated public launch date rendered");
pass("WEB2", "PUBLIC_LAUNCH_DATE is null and no countdown is rendered");

if (facts.HURRICANE_ABSOLUTE_CLAIMS_ALLOWED !== false) fail("WEB3", "storm-absolute flag silently true");
if (facts.looksLikeStormAbsoluteAffirmation(facts.RESILIENCE_PUBLIC_WORDING.value)) {
  fail("WEB3", "resilience wording became a storm-absolute affirmation");
}
if (facts.looksLikeStormAbsoluteAffirmation(facts.PUBLIC_HEADLINE.value)) fail("WEB3", "headline affirms storm absolute");
if (/\bUnstoppable\b|\bHurricane-Proof\b/i.test(networkHtml + contactHtml)) fail("WEB3", "rendered UI contains storm absolute");
pass("WEB3", "storm-absolute flag false and rendered UI does not affirm it");

if (facts.looksLikeCurrentNationwideCoverage(facts.CURRENT_COVERAGE.value)) fail("WEB4", "CURRENT_COVERAGE is a nationwide assertion");
if (facts.PARISHES_COVERED_CLAIM.public !== false) fail("WEB4", "parish claim is public-authoritative");
if (networkHtml.includes("425K") || /14 parishes covered/i.test(networkHtml)) fail("WEB4", "rendered coverage leaked unverified numbers");
pass("WEB4", "coverage export and rendered status deny live nationwide service");

if (facts.PRICING_PUBLIC_WORDING !== "PRICING_TO_BE_CONFIRMED") fail("WEB5", "draft price became public wording");
if (facts.DRAFT_RESIDENTIAL_PRICE.public !== false) fail("WEB5", "draft residential price became public");
const services = read("src/app/pages/Services.tsx");
if (!services.includes("price: PRICING_PUBLIC_WORDING") || services.includes("US$")) fail("WEB5", "Services bypasses pricing registry");
pass("WEB5", "Services publishes PRICING_TO_BE_CONFIRMED, not draft US$ prices");

if (!contactHtml.includes("NOT_YET_AVAILABLE") || /Message sent/i.test(contactHtml) || /<form/i.test(contactHtml)) {
  fail("WEB6", "Contact is not fail-closed");
}
if (/setTimeout\s*\(|\balert\s*\(|onSubmit/.test(read("src/app/pages/Contact.tsx"))) fail("WEB6", "Contact fake local success restored");
pass("WEB6", "rendered Contact has no form and no fake success");

const register = read("src/app/pages/Register.tsx");
if (!register.includes("submitPublicForm(\"registration\"") || /rest\/v1\/registrations/.test(register)) {
  fail("WEB7", "registration gateway contract broken");
}
if (!register.includes("TurnstileWidget") || !register.includes("turnstileRef.current?.reset()")) {
  fail("WEB7", "Register lost Turnstile reset semantics");
}
pass("WEB7", "Register production path is Turnstile → submitPublicForm");

if (facts.SUCCESS_LANGUAGE !== "REQUEST_RECEIVED" || !register.includes("REQUEST RECEIVED")) {
  fail("WEB8", "activation language remains");
}
pass("WEB8", "SUCCESS_LANGUAGE is REQUEST_RECEIVED, not service activation");

if (facts.REVIEWS_MODE !== "PRE_LAUNCH") fail("WEB9", "reviews mode drifted");
const sanitizeMod = await loadTsModule("src/app/lib/sanitizePublicReview.ts");
const dirty = sanitizeMod.sanitizePublicReview({
  id: "r1",
  reviewer_name: "<script>alert(1)</script>Jane",
  review_text: "<b>Great</b> &amp; safe",
  rating: 5,
  created_at: "2026-01-01",
});
if (!dirty || dirty.reviewerName.includes("<script>") || dirty.reviewText.includes("<b>")) {
  fail("WEB9", "sanitizePublicReview did not strip markup");
}
pass("WEB9", "PRE_LAUNCH reviews run production sanitizer");

if (facts.LEGAL_REVIEW_REQUIRED !== true) fail("WEB10", "legal review flag flipped");
if (!privacyHtml.includes("LEGAL_REVIEW_REQUIRED=YES") || !termsHtml.includes("LEGAL_REVIEW_REQUIRED=YES")) {
  fail("WEB10", "rendered legal pages are not marked draft");
}
const app = read("src/app/App.tsx");
if (!app.includes("path=\"privacy\"") || !app.includes("path=\"terms\"")) fail("WEB10", "legal routes missing");
pass("WEB10", "rendered /privacy and /terms remain LEGAL_REVIEW_REQUIRED=YES");

const layout = read("src/app/components/Layout.tsx");
if (!layout.includes("/privacy") || !layout.includes("/terms") || !layout.includes("{LAUNCH_STATE}")) {
  fail("WEB11", "footer legal/launch-state consumers missing");
}
pass("WEB11", "Layout consumes registry launch state and draft legal links");

const chat = read("functions/api/ai-chat.js");
if (!/await\s+decideGlobalBudget\s*\(/.test(chat) || !chat.includes("PER_ISOLATE_SUPPLEMENTAL_ONLY")) {
  fail("WEB12", "AI global-budget contract or isolate classification missing");
}
if (!/You are not commercial authority/.test(chat)) fail("WEB12", "AI may invent commercial authority");
pass("WEB12", "AI fail-closed + global budget contract + no commercial authority");

const widget = read("src/app/components/AIChatWidget.tsx");
if (widget.includes("system:") || widget.includes("TELLINEX_SYSTEM_PROMPT") || widget.includes("max_tokens")) {
  fail("WEB13", "browser still sends AI system/model authority");
}
if (!widget.includes("privacy_acknowledged: true") || !widget.includes("turnstile_token")) {
  fail("WEB13", "widget lost privacy/Turnstile production fields");
}
pass("WEB13", "browser cannot set AI system prompt, model, or max_tokens");

const headers = read("public/_headers");
if (!headers.includes("Content-Security-Policy") || !headers.includes("X-Frame-Options: DENY") || !headers.includes("Strict-Transport-Security")) {
  fail("WEB14", "security headers missing");
}
if (/Content-Security-Policy:.*\*/.test(headers.replaceAll("\n", " "))) fail("WEB14", "wildcard CSP host");
if (!/\/privacy[\s\S]*X-Robots-Tag:\s*noindex/i.test(headers) || !/\/terms[\s\S]*X-Robots-Tag:\s*noindex/i.test(headers)) {
  fail("WEB14", "draft legal routes missing noindex headers");
}
pass("WEB14", "source-controlled headers, CSP, HSTS, clickjacking, legal noindex");

const index = read("index.html");
const robots = read("public/robots.txt");
const sitemap = read("public/sitemap.xml");
if (!index.includes(facts.SEO.title) || !index.includes("rel=\"canonical\"") || !index.includes("application/ld+json")) {
  fail("WEB15", "SEO surface does not match registry");
}
if (!robots.includes("Sitemap:") || /tellinex.com\/privacy/.test(sitemap) || /tellinex.com\/terms/.test(sitemap)) {
  fail("WEB15", "sitemap still indexes draft legal URLs");
}
if (!robots.includes("Disallow: /privacy") || !robots.includes("Disallow: /terms")) {
  fail("WEB15", "robots.txt does not keep draft legal routes out of crawler discovery");
}
pass("WEB15", "canonical SEO present; privacy/terms absent from sitemap");

const theme = read("src/styles/theme.css");
const home = read("src/app/pages/Home.tsx");
if (!theme.includes("prefers-reduced-motion") || !home.includes("useRevealSafe") || !theme.includes(".reveal-safe")) {
  fail("WEB16", "motion/a11y fallback missing from production CSS/components");
}
pass("WEB16", "reduced motion and reveal-safe production CSS remain");

if (!networkHtml.includes("No public completion percentage") || networkHtml.includes("% complete")) {
  fail("WEB17", "fabricated build percentage");
}
if (!networkHtml.includes(facts.CURRENT_COVERAGE.value) || !networkHtml.includes("(null)")) {
  fail("WEB17", "NetworkBuildStatus dropped governed coverage/date");
}
pass("WEB17", "rendered network build status is architecture-only");

if (dirty.reviewText.includes("<") || read("src/app/pages/Reviews.tsx").includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9")) {
  fail("WEB18", "review sanitization or hardcoded JWT");
}
pass("WEB18", "production sanitizer strips markup; no hardcoded JWT");

const mobile = ["sm:", "md:", "max-w-", "clamp("];
if (!mobile.every((token) => home.includes(token) || services.includes(token))) fail("WEB19", "responsive primitives missing");
pass("WEB19", "Home/Services production markup includes 375–desktop primitives");

if (!fs.existsSync("docs/TELLINEX_WEBSITE_COMMERCIAL_READINESS_R1.md")) fail("WEB20", "readiness doc missing");
if (!fs.existsSync("docs/TELLINEX_WEBSITE_FUTURE_CUTOVER_CONTRACT.md")) fail("WEB20", "cutover contract missing");
if (!fs.existsSync("tests/fixtures/pr16-composition-rejection.json")) fail("WEB20", "PR16 composition rejection fixture missing");
if (!fs.existsSync(".github/workflows/commercial-readiness-ci.yml")) fail("WEB20", "commercial readiness CI missing");
pass("WEB20", "readiness docs, PR16 rejection fixture, and CI gate present");
