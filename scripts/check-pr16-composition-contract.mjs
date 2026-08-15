#!/usr/bin/env node
import fs from "node:fs";

const fail = (message) => {
  console.error(`pr16-composition-contract: FAIL — ${message}`);
  process.exit(1);
};

const fixture = JSON.parse(fs.readFileSync("tests/fixtures/pr16-composition-rejection.json", "utf8"));
const layout = fs.readFileSync("src/app/components/Layout.tsx", "utf8");
const home = fs.readFileSync("src/app/pages/Home.tsx", "utf8");
const about = fs.readFileSync("src/app/pages/About.tsx", "utf8");
const publicUi = `${layout}\n${home}\n${about}`;

if (fixture.pr16_head !== "410580f3520b362b00de30533356c11f202ed553") {
  fail("PR #16 frozen head in the composition fixture drifted");
}

for (const wording of fixture.forbidden_layout_wording) {
  if (publicUi.includes(wording)) {
    fail(`future composition rejected wording is present: ${wording}`);
  }
}
if (/\bUnstoppable\b/.test(publicUi) || /\bUnlimited\b/.test(layout)) {
  fail("PR16 Unstoppable/Unlimited storm wording class is present");
}

console.log("pr16-composition-contract: PASS");
console.log("PR16_UNSTOPPABLE_WORDING_REJECTED_BY_COMPOSITION_CONTRACT=YES");
console.log("READY_FOR_PR16_COMPOSITION=NO");
