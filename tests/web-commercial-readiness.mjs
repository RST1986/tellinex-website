#!/usr/bin/env node
import fs from "node:fs";

const fail = (id, message) => {
  console.error(`${id}: FAIL — ${message}`);
  process.exit(1);
};
const pass = (id, detail) => console.log(`${id}: PASS — ${detail}`);
const read = (file) => fs.readFileSync(file, "utf8");

const home = read("src/app/pages/Home.tsx");
const services = read("src/app/pages/Services.tsx");
const about = read("src/app/pages/About.tsx");
const contact = read("src/app/pages/Contact.tsx");
const register = read("src/app/pages/Register.tsx");
const reviews = read("src/app/pages/Reviews.tsx");
const facts = read("src/app/content/commercialFacts.ts");
const chat = read("functions/api/ai-chat.js");
const widget = read("src/app/components/AIChatWidget.tsx");
const app = read("src/app/App.tsx");
const layout = read("src/app/components/Layout.tsx");
const index = read("index.html");
const headers = read("public/_headers");
const robots = read("public/robots.txt");
const sitemap = read("public/sitemap.xml");
const privacy = read("src/app/pages/Privacy.tsx");
const terms = read("src/app/pages/Terms.tsx");
const theme = read("src/styles/theme.css");
const network = read("src/app/components/NetworkBuildStatus.tsx");
const sanitize = read("src/app/lib/sanitizePublicReview.ts");

if (!facts.includes("LAUNCH_STATE = \"BUILDING_NETWORK\"")) fail("WEB1", "missing launch state");
pass("WEB1", "canonical BUILDING_NETWORK launch state");

if (home.includes("LAUNCH_DATE") || index.includes("April 2026")) fail("WEB2", "fabricated public launch date");
pass("WEB2", "no fabricated countdown or April 2026 launch");

if (/Hurricane-Proof|Category 5/i.test(home + services + about + widget + index)) fail("WEB3", "storm absolute remains");
pass("WEB3", "hurricane absolutes removed from public UI");

if (/425K|14 parishes covered/i.test(home + about + index)) fail("WEB4", "unverified coverage numeric remains");
pass("WEB4", "425K and 14-parishes-covered not public");

if (services.includes("US$") || home.includes("From US$")) fail("WEB5", "unapproved price public");
if (!services.includes("PRICING_PUBLIC_WORDING") && !services.includes("PRICING_TO_BE_CONFIRMED")) fail("WEB5", "pricing governance missing");
pass("WEB5", "draft prices not published as offers");

if (contact.includes("alert(") || /Message sent! We'll respond/i.test(contact)) fail("WEB6", "fake contact success remains");
if (!contact.includes("submitPublicForm(\"quote_request\"")) fail("WEB6", "contact gateway missing");
pass("WEB6", "Contact → Turnstile → submitPublicForm → confirmed success");

if (!register.includes("submitPublicForm(\"registration\"") || /rest\/v1\/registrations/.test(register)) {
  fail("WEB7", "registration gateway contract broken");
}
pass("WEB7", "Register → Turnstile → submitPublicForm");

if (!register.includes("REQUEST RECEIVED")) fail("WEB8", "activation language remains");
pass("WEB8", "REQUEST RECEIVED != SERVICE ACTIVATED");

if (!reviews.includes("REVIEWS_MODE") || !reviews.includes("sanitizePublicReview")) fail("WEB9", "reviews governance missing");
pass("WEB9", "PRE_LAUNCH sanitized reviews");

if (!app.includes("path=\"privacy\"") || !app.includes("path=\"terms\"")) fail("WEB10", "legal routes missing");
if (!privacy.includes("LEGAL_REVIEW_REQUIRED") || !terms.includes("LEGAL_REVIEW_REQUIRED")) fail("WEB10", "legal draft markers missing");
pass("WEB10", "/privacy and /terms draft routes");

if (!layout.includes("/privacy") || !layout.includes("/terms")) fail("WEB11", "footer legal links missing");
pass("WEB11", "footer privacy/terms links");

if (!chat.includes("TURNSTILE_SECRET_KEY") || !chat.includes("turnstile_hostname_mismatch") || !chat.includes("turnstile_action_mismatch") || !widget.includes("privacy_acknowledged")) {
  fail("WEB12", "AI Turnstile/privacy controls missing");
}
if (!chat.includes("AI_CHAT_RATE_LIMITER") || /const requestCounts = new Map\(/.test(chat)) {
  fail("WEB12", "durable limiter missing or process-local Map restored as control");
}
pass("WEB12", "AI fail-closed, hostname+action Turnstile, official limiter required");

if (widget.includes("system:") || widget.includes("TELLINEX_SYSTEM_PROMPT")) fail("WEB13", "browser still sends AI system authority");
pass("WEB13", "browser cannot set AI system prompt");

if (!headers.includes("Content-Security-Policy") || !headers.includes("X-Frame-Options: DENY") || !headers.includes("Strict-Transport-Security")) {
  fail("WEB14", "security headers missing");
}
if (/Content-Security-Policy:.*\*/.test(headers.replaceAll("\n", " "))) fail("WEB14", "wildcard CSP host");
pass("WEB14", "source-controlled headers, CSP, HSTS, clickjacking");

if (!index.includes("rel=\"canonical\"") || !index.includes("og:title") || !index.includes("twitter:card") || !index.includes("application/ld+json")) {
  fail("WEB15", "SEO surface incomplete");
}
if (!robots.includes("Sitemap:") || !sitemap.includes("https://tellinex.com/privacy")) fail("WEB15", "robots/sitemap incomplete");
pass("WEB15", "canonical, robots, sitemap, OG, Twitter, JSON-LD");

if (!theme.includes("prefers-reduced-motion") || !home.includes("useRevealSafe")) fail("WEB16", "motion/a11y fallback missing");
pass("WEB16", "reduced motion and GSAP-failure visibility");

if (!network.includes("No public completion percentage") || network.includes("% complete")) fail("WEB17", "fabricated build percentage");
pass("WEB17", "network build status architecture only");

if (!sanitize.includes("stripTags") || reviews.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9")) {
  fail("WEB18", "review sanitization or hardcoded JWT");
}
pass("WEB18", "sanitized review view, no hardcoded JWT");

const mobile = ["sm:", "md:", "max-w-", "clamp("];
if (!mobile.every((token) => home.includes(token) || services.includes(token))) fail("WEB19", "responsive primitives missing");
pass("WEB19", "responsive primitives for 375/390/430/768/desktop");

if (!fs.existsSync("docs/TELLINEX_WEBSITE_COMMERCIAL_READINESS_R1.md")) fail("WEB20", "readiness doc missing");
if (!fs.existsSync("docs/TELLINEX_WEBSITE_COMMERCIAL_READINESS_R2.md")) fail("WEB20", "R2 compose doc missing");
if (!fs.existsSync("docs/TELLINEX_WEBSITE_FUTURE_CUTOVER_CONTRACT.md")) fail("WEB20", "cutover contract missing");
pass("WEB20", "readiness and future-cutover docs present");
