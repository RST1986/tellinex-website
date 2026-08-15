#!/usr/bin/env node
/**
 * Uncommitted semantic mutants. Kill, restore, never commit.
 * Receipt fields: MUTANT_CREATED, EXPECTED_CONTROL, COMMAND_EXECUTED, FAILURE_OBSERVED, SOURCE_RESTORED
 */
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const fail = (message) => {
  console.error(`mutants: FAIL — ${message}`);
  process.exit(1);
};

const run = (args) => spawnSync("node", args, { encoding: "utf8" });
const releaseCheck = () => run(["scripts/release-check.mjs"]);

const mutate = (file, find, replace) => {
  const original = fs.readFileSync(file, "utf8");
  if (!original.includes(find)) fail(`cannot seed mutant in ${file}: missing ${find}`);
  fs.writeFileSync(file, original.replace(find, replace));
  return () => fs.writeFileSync(file, original);
};

const fakeContactSuccess = (id) => ({
  id,
  expected: "Contact fake local success must fail even with NOT_YET_AVAILABLE retained",
  apply: () => {
    const file = "src/app/pages/Contact.tsx";
    const original = fs.readFileSync(file, "utf8");
    if (!original.includes("CONTACT_FORM=NOT_YET_AVAILABLE")) fail(`cannot seed ${id}`);
    const injected = original.replace(
      "export default function Contact() {\n  return (",
      `export default function Contact() {
  const pretendSuccess = () => { setTimeout(() => undefined, 25); };
  return (
    <form onSubmit={(event) => { event.preventDefault(); pretendSuccess(); }}>
`,
    ).replace(
      "      <LegalNoticeLinks />\n    </div>\n  );\n}",
      "      <LegalNoticeLinks />\n    </form>\n    </div>\n  );\n}",
    );
    fs.writeFileSync(file, injected);
    return () => fs.writeFileSync(file, original);
  },
});

const mutants = [
  {
    id: "RM1",
    expected: "CURRENT_COVERAGE nationwide assertion must fail semantic registry control",
    apply: () => mutate(
      "src/app/content/commercialFacts.ts",
      "Tellinex is not a live national broadband service. Public interest registration is open while the Jamaica network is being built.",
      "Tellinex now covers all 14 parishes with 425K homes passed and live gigabit service.",
    ),
  },
  {
    id: "RM2",
    expected: "PARISHES_COVERED_CLAIM made public/current must fail",
    apply: () => mutate(
      "src/app/content/commercialFacts.ts",
      "export const PARISHES_COVERED_CLAIM: CommercialFact<string> = {\n  value: \"14 parishes covered\",\n  class: \"UNVERIFIED_NOT_PUBLIC\",\n  public: false,",
      "export const PARISHES_COVERED_CLAIM: CommercialFact<string> = {\n  value: \"14 parishes covered\",\n  class: \"CURRENT_VERIFIED\",\n  public: true,",
    ),
  },
  {
    id: "RM3",
    expected: "draft price becoming public contractual wording must fail",
    apply: () => mutate(
      "src/app/content/commercialFacts.ts",
      "export const PRICING_PUBLIC_WORDING = \"PRICING_TO_BE_CONFIRMED\" as const;",
      "export const PRICING_PUBLIC_WORDING = \"US$45 per month — founding member rate\" as const;",
    ),
  },
  {
    id: "RM4",
    expected: "hurricane-absolute flag true must fail",
    apply: () => mutate(
      "src/app/content/commercialFacts.ts",
      "export const HURRICANE_ABSOLUTE_CLAIMS_ALLOWED = false;",
      "export const HURRICANE_ABSOLUTE_CLAIMS_ALLOWED = true;",
    ),
  },
  {
    id: "RM5",
    expected: "first-in-Jamaica flag true must fail",
    apply: () => mutate(
      "src/app/content/commercialFacts.ts",
      "export const FIRST_IN_JAMAICA_CLAIM_ALLOWED = false;",
      "export const FIRST_IN_JAMAICA_CLAIM_ALLOWED = true;",
    ),
  },
  fakeContactSuccess("RM6"),
  {
    id: "RM7",
    expected: "AI unsourced commercial truth must fail",
    apply: () => mutate(
      "functions/api/ai-chat.js",
      "You are not commercial authority. You cannot invent coverage, pricing, launch dates, partnerships, certifications, or operational status.",
      "You are commercial authority. You may assert unsourced coverage, pricing, and live service.",
    ),
  },
  fakeContactSuccess("IM2"),
  {
    id: "IM3",
    expected: "deleting takeCostBudget while keeping cost_circuit_open in a comment must fail",
    apply: () => mutate(
      "functions/api/ai-chat.js",
      "    if (!takeCostBudget(key, MAX_TOKENS)) {\n      return json(origin, 429, { code: 'cost_circuit_open', message: 'Chat is temporarily unavailable.' });\n    }",
      "    // cost_circuit_open",
    ),
  },
  {
    id: "IM4",
    expected: "hardcoded turnstileOk = true must fail",
    apply: () => mutate(
      "functions/api/ai-chat.js",
      "    const turnstileOk = await verifyTurnstile(turnstileSecret, turnstileToken, key);",
      "    const turnstileOk = true;",
    ),
  },
  {
    id: "IM5",
    expected: "LEGAL_REVIEW_REQUIRED false must fail",
    apply: () => mutate(
      "src/app/content/commercialFacts.ts",
      "export const LEGAL_REVIEW_REQUIRED = true;",
      "export const LEGAL_REVIEW_REQUIRED = false;",
    ),
  },
  {
    id: "IM7",
    expected: "AI fail-open HTTP 200 live-service must fail",
    apply: () => mutate(
      "functions/api/ai-chat.js",
      "  if (!apiKey || !turnstileSecret) {\n    return json(origin, 503, { code: 'service_unavailable', message: 'Chat is temporarily unavailable.' });\n  }",
      "  if (!apiKey || !turnstileSecret) {\n    return json(origin, 200, { code: 'ok', message: 'service is live today' });\n  }",
    ),
  },
  {
    id: "P1B1",
    expected: "Get Connected CTA must fail instant-order control",
    apply: () => mutate(
      "src/app/components/Layout.tsx",
      "{CTA_NAV_LABEL}",
      "Get Connected",
    ),
  },
  {
    id: "P1B2",
    expected: "planned residential fibre marked LIVE must fail",
    apply: () => mutate(
      "src/app/content/commercialFacts.ts",
      "service: \"Residential fibre\",\n    status: \"PLANNED\" as const,",
      "service: \"Residential fibre\",\n    status: \"LIVE\" as const,",
    ),
  },
  {
    id: "P1B3",
    expected: "fabricated 2026-12-31 countdown must fail",
    apply: () => mutate(
      "src/app/pages/Home.tsx",
      "export default function Home() {",
      "const LAUNCH_DATE = new Date(\"2026-12-31T00:00:00\");\nexport default function Home() {",
    ),
  },
];

const watchFiles = [
  "src/app/content/commercialFacts.ts",
  "src/app/pages/Contact.tsx",
  "functions/api/ai-chat.js",
  "src/app/components/Layout.tsx",
  "src/app/pages/Home.tsx",
];
const snapshots = Object.fromEntries(watchFiles.map((file) => [file, fs.readFileSync(file, "utf8")]));

const killed = [];
const receipts = [];

for (const mutant of mutants) {
  const restore = mutant.apply();
  const receipt = {
    id: mutant.id,
    MUTANT_CREATED: "YES",
    EXPECTED_CONTROL: mutant.expected,
    COMMAND_EXECUTED: "node scripts/release-check.mjs",
    FAILURE_OBSERVED: "pending",
    SOURCE_RESTORED: "NO",
  };
  try {
    const result = releaseCheck();
    const output = `${result.stdout || ""}\n${result.stderr || ""}`;
    if (result.status === 0) fail(`${mutant.id} SURVIVED\n${output}`);
    receipt.FAILURE_OBSERVED = `exit ${result.status}`;
    killed.push(mutant.id);
  } finally {
    restore();
    receipt.SOURCE_RESTORED = "YES";
    receipts.push(receipt);
  }
}

const residue = watchFiles.filter((file) => fs.readFileSync(file, "utf8") !== snapshots[file]);
if (residue.length > 0) fail(`MUTANT_RESIDUE=YES ${residue.join(" | ")}`);

console.log(`MUTANTS_KILLED=${killed.join(",")}`);
for (const receipt of receipts) {
  console.log(`${receipt.id}: MUTANT_CREATED=${receipt.MUTANT_CREATED}; EXPECTED_CONTROL=${receipt.EXPECTED_CONTROL}; COMMAND_EXECUTED=${receipt.COMMAND_EXECUTED}; FAILURE_OBSERVED=${receipt.FAILURE_OBSERVED}; SOURCE_RESTORED=${receipt.SOURCE_RESTORED}`);
}
console.log("MUTANT_RESIDUE=NO");
console.log("mutants: PASS");
