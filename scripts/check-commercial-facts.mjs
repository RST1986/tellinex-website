#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

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

const registry = fs.readFileSync("src/app/content/commercialFacts.ts", "utf8");
for (const token of [
  "CURRENT_VERIFIED",
  "PLANNED",
  "TARGET",
  "DRAFT",
  "UNVERIFIED",
  "LAUNCH_STATE = \"BUILDING_NETWORK\"",
  "PUBLIC_LAUNCH_DATE: string | null = null",
  "COMMERCIAL_LIVE = false",
  "FIRST_CLAIM_REQUIRES_INDEPENDENT_EVIDENCE = true",
  "HOMES_PASSED_425K",
  "UNVERIFIED_NOT_PUBLIC",
]) {
  if (!registry.includes(token)) fail(`commercialFacts.ts missing ${token}`);
}

const publicFiles = [
  ...walk("src/app"),
  "index.html",
  "functions/api/ai-chat.js",
].filter((file) => fs.existsSync(file));

const forbidden = [
  { re: /Hurricane-Proof/i, why: "hurricane absolute" },
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
];

for (const file of publicFiles) {
  if (file.includes("commercialFacts.ts") || file.includes("check-commercial-facts")) continue;
  const text = fs.readFileSync(file, "utf8");
  for (const rule of forbidden) {
    if (rule.re.test(text)) fail(`${file} contains ${rule.why}`);
  }
}

const reviewsPage = fs.readFileSync("src/app/pages/Reviews.tsx", "utf8");
if (!reviewsPage.includes("sanitizePublicReview")) fail("Reviews must sanitize the public view");

const register = fs.readFileSync("src/app/pages/Register.tsx", "utf8");
if (!register.includes("submitPublicForm(\"registration\"")) fail("Register lost gateway submit");
if (!register.includes("REQUEST RECEIVED")) fail("Register success language must be REQUEST RECEIVED");
if (/rest\/v1\/registrations/.test(register)) fail("DIRECT_REGISTRATION_BROWSER_INSERT must be NO");

const contact = fs.readFileSync("src/app/pages/Contact.tsx", "utf8");
if (contact.includes("alert(")) fail("Contact still has fake alert success");
if (!contact.includes("NOT_YET_AVAILABLE") && !contact.includes("submitPublicForm")) {
  fail("Contact must be disabled or gateway-backed");
}

console.log("commercial-facts: PASS");
console.log("DIRECT_REGISTRATION_BROWSER_INSERT=NO");
console.log("LAUNCH_STATE=BUILDING_NETWORK");
console.log("COMMERCIAL_LIVE=NO");
