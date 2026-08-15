#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const CACHE_DIR = path.resolve("node_modules/.cache/tellinex-semantic");

export function transpileTs(source, fileName) {
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
      isolatedModules: true,
    },
    fileName,
  });
  return result.outputText;
}

function resolveRelative(fromFile, spec) {
  const resolved = path.resolve(path.dirname(fromFile), spec);
  if (path.extname(resolved)) return resolved;
  if (fs.existsSync(`${resolved}.ts`)) return `${resolved}.ts`;
  if (fs.existsSync(`${resolved}.tsx`)) return `${resolved}.tsx`;
  if (fs.existsSync(`${resolved}.js`)) return `${resolved}.js`;
  return resolved;
}

export async function loadTsModule(entryRel) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const entryAbs = path.resolve(entryRel);
  const compiled = new Map();
  const queue = [entryAbs];
  const seen = new Set();

  while (queue.length > 0) {
    const abs = queue.pop();
    if (seen.has(abs)) continue;
    seen.add(abs);
    const source = fs.readFileSync(abs, "utf8");
    for (const match of source.matchAll(/from\s+["'](\.[^"']+)["']/g)) {
      const resolved = resolveRelative(abs, match[1]);
      if (/\.(ts|tsx)$/.test(resolved) && fs.existsSync(resolved)) queue.push(resolved);
    }
    const out = path.join(CACHE_DIR, `${createHash("sha1").update(abs).digest("hex")}.mjs`);
    compiled.set(abs, out);
  }

  for (const [abs, out] of compiled) {
    let source = fs.readFileSync(abs, "utf8");
    source = source.replace(/from\s+["'](\.[^"']+)["']/g, (full, spec) => {
      const resolved = resolveRelative(abs, spec);
      if (compiled.has(resolved)) {
        return `from ${JSON.stringify(pathToFileURL(compiled.get(resolved)).href)}`;
      }
      return full;
    });
    fs.writeFileSync(out, transpileTs(source, abs));
  }

  const entryOut = compiled.get(entryAbs);
  return import(`${pathToFileURL(entryOut).href}?t=${Date.now()}`);
}

export async function loadCommercialFacts() {
  return loadTsModule("src/app/content/commercialFacts.ts");
}
