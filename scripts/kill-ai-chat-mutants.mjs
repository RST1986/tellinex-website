#!/usr/bin/env node
/**
 * Uncommitted mutants against the AI chat abuse boundary.
 * Kill, restore, never commit. Does not treat Map increment as durable.
 */
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const fail = (message) => {
  console.error(`ai-chat-mutants: FAIL — ${message}`);
  process.exit(1);
};

const run = () => spawnSync(process.execPath, ["tests/sec-ai-chat-boundary.mjs"], { encoding: "utf8" });
const sourceCheck = () => spawnSync(process.execPath, ["scripts/check-chatbot-public-form-boundary.mjs"], { encoding: "utf8" });

const mutate = (file, find, replace) => {
  const original = fs.readFileSync(file, "utf8");
  if (!original.includes(find)) fail(`cannot seed mutant in ${file}: missing ${find}`);
  fs.writeFileSync(file, original.replace(find, replace));
  return () => fs.writeFileSync(file, original);
};

const mutants = [
  {
    id: "A1",
    apply: () => mutate("functions/api/ai-chat.js", "if (!turnstileToken) {", "if (!turnstileToken && false) {"),
    check: run,
  },
  {
    id: "A2",
    apply: () => mutate("functions/api/ai-chat.js", "if (data?.success !== true) {", "if (data?.success !== true && false) {"),
    check: run,
  },
  {
    id: "A3",
    apply: () => mutate("functions/api/ai-chat.js", "if (!expectedHostnames.has(hostname)) {", "if (false && !expectedHostnames.has(hostname)) {"),
    check: run,
  },
  {
    id: "A4",
    apply: () => mutate("functions/api/ai-chat.js", "if (data.action !== expectedAction) {", "if (false && data.action !== expectedAction) {"),
    check: run,
  },
  {
    id: "A5",
    apply: () => mutate("functions/api/ai-chat.js", "if (body?.system || body?.model || body?.max_tokens) {", "if (false && (body?.system || body?.model || body?.max_tokens)) {"),
    check: run,
  },
  {
    id: "A6",
    apply: () => mutate("src/app/components/AIChatWidget.tsx", 'action="tellinex_ai_chat"', 'action="quote_request"'),
    check: run,
  },
  {
    id: "A7",
    apply: () => mutate("functions/api/ai-chat.js", "if (!limiter || typeof limiter.limit !== 'function') {", "if (false && (!limiter || typeof limiter.limit !== 'function')) {"),
    check: run,
  },
  {
    id: "A8",
    apply: () => mutate("functions/api/ai-chat.js", "quote_persisted: false", "quote_persisted: true"),
    check: sourceCheck,
  },
  {
    id: "A9",
    apply: () => mutate("src/app/components/AIChatWidget.tsx", "privacy_acknowledged: true", "privacy_acknowledged: false"),
    check: run,
  },
  {
    id: "A10",
    apply: () => mutate("functions/api/ai-chat.js", "return allowedOrigins(env).has(origin);", "return true;"),
    check: run,
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

console.log(`AI_CHAT_MUTANTS_KILLED=${killed.join(",")}`);
console.log("ai-chat-mutants: PASS");
