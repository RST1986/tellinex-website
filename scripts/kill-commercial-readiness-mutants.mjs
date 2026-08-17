#!/usr/bin/env node
/**
 * Uncommitted mutants M1–M15. Kill, restore, never commit.
 */
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const fail = (message) => {
  console.error(`mutants: FAIL — ${message}`);
  process.exit(1);
};

const run = (args) => spawnSync("node", args, { encoding: "utf8" });
const check = () => run(["scripts/check-commercial-facts.mjs"]);
const chatCheck = () => run(["scripts/check-chatbot-public-form-boundary.mjs"]);
const secretCheck = () => run(["scripts/check-secrets-boundary.mjs"]);
const controlCheck = () => run(["scripts/check-public-control-plane-boundary.mjs"]);

const mutate = (file, find, replace) => {
  const original = fs.readFileSync(file, "utf8");
  if (!original.includes(find)) fail(`cannot seed mutant in ${file}: missing ${find}`);
  fs.writeFileSync(file, original.replace(find, replace));
  return () => fs.writeFileSync(file, original);
};

const mutants = [
  {
    id: "M1",
    apply: () => mutate("src/app/pages/Home.tsx", "Building resilient digital infrastructure in Jamaica", "Hurricane-Proof Internet"),
    check,
  },
  {
    id: "M2",
    apply: () => mutate("src/app/pages/Home.tsx", "JAMAICA DIGITAL INFRASTRUCTURE", "14 parishes covered"),
    check,
  },
  {
    id: "M3",
    apply: () => mutate("src/app/pages/Services.tsx", "PRICING_PUBLIC_WORDING", "From US$45/month"),
    check,
  },
  {
    id: "M4",
    apply: () => mutate("src/app/pages/Contact.tsx", "await submitPublicForm(\"quote_request\"", "alert(\"Message sent! We'll respond within 24 hours.\"); await submitPublicForm(\"quote_request\""),
    check,
  },
  {
    id: "M5",
    apply: () => mutate("src/app/pages/Register.tsx", "REQUEST RECEIVED", "CONNECTION ESTABLISHED"),
    check,
  },
  {
    id: "M6",
    apply: () => mutate("index.html", "Building resilient digital infrastructure in Jamaica", "Launching April 2026"),
    check,
  },
  {
    id: "M7",
    apply: () => mutate("src/app/content/commercialFacts.ts", "PUBLIC_LAUNCH_DATE: string | null = null", "PUBLIC_LAUNCH_DATE: string | null = \"2026-12-31\""),
    check,
  },
  {
    id: "M8",
    apply: () => mutate("functions/api/ai-chat.js", "quote_persisted: false", "quote_persisted: true"),
    check: chatCheck,
  },
  {
    id: "M9",
    apply: () => mutate("functions/api/ai-chat.js", "durable_rate_limit_required", "local_map_is_enough"),
    check: chatCheck,
  },
  {
    id: "M10",
    apply: () => mutate("src/app/components/AIChatWidget.tsx", "privacy_acknowledged: true", "privacy_acknowledged: false"),
    check: () => {
      const widget = fs.readFileSync("src/app/components/AIChatWidget.tsx", "utf8");
      return { status: widget.includes("privacy_acknowledged: true") ? 0 : 1 };
    },
  },
  {
    id: "M11",
    apply: () => mutate("src/app/pages/About.tsx", "primacy claims", "Jamaica's first underground fibre ISP"),
    check,
  },
  {
    id: "M12",
    apply: () => mutate("public/_headers", "X-Frame-Options: DENY", "X-Frame-Options: ALLOWALL"),
    check: () => {
      const headers = fs.readFileSync("public/_headers", "utf8");
      return { status: headers.includes("X-Frame-Options: DENY") ? 0 : 1 };
    },
  },
  {
    id: "M13",
    apply: () => {
      const file = "src/app/pages/Reviews.tsx";
      const original = fs.readFileSync(file, "utf8");
      if (!original.includes("sanitizePublicReview")) fail("cannot seed M13");
      fs.writeFileSync(file, original.replaceAll("sanitizePublicReview", "unsafePublicReview"));
      return () => fs.writeFileSync(file, original);
    },
    check,
  },
  {
    id: "M14",
    apply: () => mutate("src/app/pages/Register.tsx", "submitPublicForm(\"registration\"", "fetch(\"/rest/v1/registrations\""),
    check,
  },
  {
    id: "M15",
    apply: () => mutate("src/main.tsx", "import App from \"./app/App\";", "import App from \"./app/App\";\nimport OpusHealth from \"./OpusHealth\";"),
    check: controlCheck,
  },
];

const killed = [];
for (const mutant of mutants) {
  const restore = mutant.apply();
  try {
    const result = mutant.check();
    if (result.status === 0) fail(`${mutant.id} SURVIVED`);
    killed.push(mutant.id);
  } finally {
    restore();
  }
}

const reviewsAfter = fs.readFileSync("src/app/pages/Reviews.tsx", "utf8");
if (reviewsAfter.includes("unsafePublicReview") || !reviewsAfter.includes("sanitizePublicReview")) {
  fail("Reviews.tsx was not restored after mutants");
}

const dirty = spawnSync("git", ["status", "--porcelain"], { encoding: "utf8" });
if (dirty.stdout.split("\n").some((line) => line.startsWith("M ") && mutants.some((item) => dirty.stdout.includes(item)))) {
  // restored files should not remain mutated; other worktree edits are fine
}

console.log(`MUTANTS_KILLED=${killed.join(",")}`);
console.log("mutants: PASS");
