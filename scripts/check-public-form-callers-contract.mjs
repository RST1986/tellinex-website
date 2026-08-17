import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const files = {
  app: "src/app/App.tsx",
  layout: "src/app/components/Layout.tsx",
  contact: "src/app/pages/Contact.tsx",
  availability: "src/app/pages/Availability.tsx",
  status: "src/app/pages/Status.tsx",
  register: "src/app/pages/Register.tsx",
  reviews: "src/app/pages/Reviews.tsx",
  helper: "src/app/lib/publicForms.ts",
};

function read(relativePath) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) throw new Error(`Missing public-form caller artifact: ${relativePath}`);
  return fs.readFileSync(absolute, "utf8");
}

function requireText(source, needle, label) {
  if (!source.includes(needle)) throw new Error(`Public-form caller contract missing ${label}: ${needle}`);
}

const source = Object.fromEntries(Object.entries(files).map(([key, file]) => [key, read(file)]));

for (const [key, formType, action] of [
  ["contact", "quote_request", "quote_request"],
  ["availability", "pre_registration", "pre_registration"],
  ["status", "status_subscription", "status_subscription"],
  ["register", "registration", "public_registration"],
  ["reviews", "customer_review", "customer_review"],
]) {
  requireText(source[key], `submitPublicForm("${formType}"`, `${formType} gateway call`);
  requireText(source[key], `action="${action}"`, `${formType} Turnstile action`);
  requireText(source[key], "TurnstileWidget", `${formType} Turnstile component`);
  requireText(source[key], "turnstileRef.current?.reset()", `${formType} token reset`);
}

for (const [route, page] of [
  ["availability", "Availability"],
  ["status", "Status"],
]) {
  requireText(source.app, `path="${route}"`, `${route} route`);
  requireText(source.app, `element={<${page} />}`, `${page} route element`);
  requireText(source.layout, `to: "/${route}"`, `${route} navigation`);
}

for (const formType of [
  "access_request",
  "customer_review",
  "pre_registration",
  "quote_request",
  "registration",
  "status_subscription",
]) {
  requireText(source.helper, `| "${formType}"`, `${formType} helper type`);
}

const allPages = [source.contact, source.availability, source.status, source.register, source.reviews].join("\n");
if (/\.from\([^)]*(access_requests|customer_reviews|pre_registrations|quote_requests|registrations|status_page_subscriptions)/.test(allPages)) {
  throw new Error("Direct browser table insertion detected in public form callers");
}
if (source.contact.includes("alert(\"Message sent")) {
  throw new Error("Contact still contains the placeholder success alert");
}
if (!source.contact.includes("role=\"alert\"") || !source.availability.includes("role=\"alert\"") || !source.status.includes("role=\"alert\"")) {
  throw new Error("A new public caller is missing an accessible error region");
}

console.log("Public-form caller contract: PASS");
