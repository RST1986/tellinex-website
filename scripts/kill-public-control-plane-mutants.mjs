#!/usr/bin/env node
/**
 * Uncommitted mutants M1–M5. Kill, restore from in-memory snapshots, never commit.
 * Does not use git checkout (working tree already differs from HEAD).
 * Run: node scripts/kill-public-control-plane-mutants.mjs
 */
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const runChecker = () =>
  spawnSync(process.execPath, ["scripts/check-public-control-plane-boundary.mjs"], {
    encoding: "utf8",
  });

const snapshot = (file) => (fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null);

const restoreFile = (file, original) => {
  if (original === null) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    return;
  }
  fs.writeFileSync(file, original);
};

let failed = 0;
const kill = (id, file, original, apply) => {
  try {
    apply();
    const result = runChecker();
    if (result.status === 0) {
      console.error(`${id}: SURVIVED — checker passed on mutant`);
      failed += 1;
    } else {
      const detail = (result.stderr || result.stdout || "").trim().split("\n")[0];
      console.log(`${id}: KILLED — ${detail}`);
    }
  } finally {
    restoreFile(file, original);
  }
};

const mainPath = "src/main.tsx";
const diagnosePath = "functions/opus-diagnose.js";
const mainOriginal = snapshot(mainPath);
const diagnoseOriginal = snapshot(diagnosePath);

kill("M1", mainPath, mainOriginal, () => {
  fs.writeFileSync(
    mainPath,
    `import OpusHealth from "./OpusHealth";\nconst health = new OpusHealth("landing_page");\nhealth.start();\n${mainOriginal}`,
  );
});

kill("M2", diagnosePath, diagnoseOriginal, () => {
  fs.mkdirSync("functions", { recursive: true });
  fs.writeFileSync(
    diagnosePath,
    "export async function onRequest() { return new Response('diagnose'); }\n",
  );
});

kill("M3", mainPath, mainOriginal, () => {
  fs.writeFileSync(
    mainPath,
    `${mainOriginal}\nfetch("/rest/v1/feature_flags?id=eq.1", { method: "PATCH", body: "{}" });\n`,
  );
});

kill("M4", mainPath, mainOriginal, () => {
  fs.writeFileSync(
    mainPath,
    `${mainOriginal}\nfetch("/rest/v1/diagnosis_rules?id=eq.1", { method: "PATCH", body: "{}" });\n`,
  );
});

kill("M5", mainPath, mainOriginal, () => {
  fs.writeFileSync(
    mainPath,
    `${mainOriginal}\nfetch("/rest/v1/opus_repair_log", { method: "POST", body: "{}" });\n`,
  );
});

if (snapshot(mainPath) !== mainOriginal) {
  console.error("main.tsx not restored");
  process.exit(1);
}
if (snapshot(diagnosePath) !== diagnoseOriginal) {
  console.error("opus-diagnose.js not restored");
  process.exit(1);
}

if (failed > 0) {
  console.error(`MUTANTS_KILLED=NO (${failed} survived)`);
  process.exit(1);
}

const checker = runChecker();
if (checker.status !== 0) {
  console.error("Restore left the tree failing the boundary checker");
  process.exit(1);
}

console.log("MUTANTS_KILLED=M1,M2,M3,M4,M5");
console.log("MUTANTS_RESTORED=YES");
