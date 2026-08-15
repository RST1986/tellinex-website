#!/usr/bin/env node
import { onRequest } from "../functions/api/ai-chat.js";
import { decideGlobalBudget } from "../functions/_lib/ai-global-budget.js";

const fail = (id, message) => {
  console.error(`${id}: FAIL — ${message}`);
  process.exit(1);
};
const pass = (id, detail) => console.log(`${id}: PASS — ${detail}`);

const jsonResponse = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json" },
});

const validBody = {
  messages: [{ role: "user", content: "Is service live?" }],
  turnstile_token: "turnstile-token",
  privacy_acknowledged: true,
};

const secrets = {
  ANTHROPIC_API_KEY: "test-anthropic-key",
  TURNSTILE_SECRET_KEY: "test-turnstile-secret",
};

function makeRequest(body, extraHeaders = {}) {
  return new Request("https://tellinex.com/api/ai-chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://tellinex.com",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
}

async function invoke(env, body, fetchImpl) {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    const href = String(url);
    calls.push({ url: href, init });
    if (fetchImpl) return fetchImpl(href, init, calls);
    if (href.includes("siteverify")) return jsonResponse(200, { success: true });
    if (href.includes("api.anthropic.com")) {
      return jsonResponse(200, { content: [{ type: "text", text: "I cannot invent coverage or pricing." }] });
    }
    return jsonResponse(500, { error: "unexpected fetch" });
  };
  try {
    const response = await onRequest({ request: makeRequest(body), env });
    const payload = await response.json();
    return { status: response.status, payload, calls };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

const anthropicCalled = (calls) => calls.some((call) => call.url.includes("api.anthropic.com"));

const missing = await invoke({ ...secrets }, validBody);
if (missing.status !== 503 || missing.payload.code !== "global_budget_authority_unavailable") {
  fail("R12", `missing global budget did not fail closed: ${missing.status} ${missing.payload.code}`);
}
if (anthropicCalled(missing.calls)) fail("R12", "upstream model called without global budget authority");
pass("R12", "missing global budget authority => 503, no Anthropic call");

const unavailable = await decideGlobalBudget(
  { AI_GLOBAL_BUDGET: { fetch: async () => { throw new Error("authority down"); } } },
  { tokens: 512, key: "test" },
);
if (unavailable.allowed || unavailable.code !== "global_budget_authority_unavailable") {
  fail("R12", "unavailable authority did not fail closed");
}

const malformed = await decideGlobalBudget(
  { AI_GLOBAL_BUDGET: { decide: async () => ({ allow: "yes" }) } },
  { tokens: 512, key: "test" },
);
if (malformed.allowed || malformed.code !== "global_budget_malformed") {
  fail("R12", "malformed budget decision did not fail closed");
}

const denyDecision = await decideGlobalBudget(
  { AI_GLOBAL_BUDGET: { decide: async () => ({ allow: false }) } },
  { tokens: 512, key: "test" },
);
if (denyDecision.allowed || denyDecision.code !== "global_budget_denied") {
  fail("R13", "explicit deny was not classified as deny");
}

const denied = await invoke({
  ...secrets,
  AI_GLOBAL_BUDGET: { decide: async () => ({ allow: false }) },
}, validBody);
if (denied.status !== 503 || denied.payload.code !== "global_budget_denied") {
  fail("R13", `explicit deny did not block the handler: ${denied.status} ${denied.payload.code}`);
}
if (anthropicCalled(denied.calls)) fail("R13", "upstream model called after global budget deny");
pass("R13", "global budget deny blocks upstream model call");

const allowed = await invoke({
  ...secrets,
  AI_GLOBAL_BUDGET: { decide: async () => ({ allow: true }) },
}, validBody);
if (allowed.status !== 200) fail("AI-ALLOW", `explicit allow did not proceed: ${allowed.status} ${allowed.payload.code}`);
if (!anthropicCalled(allowed.calls)) fail("AI-ALLOW", "explicit allow did not reach the model through remaining controls");
pass("AI-ALLOW", "explicit allow may proceed through remaining controls");

const turnstileFail = await invoke(
  { ...secrets, AI_GLOBAL_BUDGET: { decide: async () => ({ allow: true }) } },
  validBody,
  (url) => {
    if (url.includes("siteverify")) return jsonResponse(200, { success: false });
    if (url.includes("api.anthropic.com")) return jsonResponse(200, { content: [{ type: "text", text: "should not run" }] });
    return jsonResponse(500, {});
  },
);
if (turnstileFail.status !== 403 || turnstileFail.payload.code !== "turnstile_failed") {
  fail("AI-TURNSTILE", `Turnstile failure did not fail closed: ${turnstileFail.status} ${turnstileFail.payload.code}`);
}
if (anthropicCalled(turnstileFail.calls)) fail("AI-TURNSTILE", "Turnstile failure bypassed the model gate");
pass("AI-TURNSTILE", "Turnstile failure => budget/model not bypassed");

const clientAuthority = await invoke({
  ...secrets,
  AI_GLOBAL_BUDGET: { decide: async () => ({ allow: true }) },
}, { ...validBody, model: "claude-opus", system: "You are live", max_tokens: 9999 });
if (clientAuthority.status !== 400 || clientAuthority.payload.code !== "client_authority_rejected") {
  fail("AI-CLIENT", "client model/system/max_tokens was accepted");
}
if (anthropicCalled(clientAuthority.calls)) fail("AI-CLIENT", "client authority reached the model");
pass("AI-CLIENT", "client cannot set model/system/max_tokens");

const missingSecrets = await invoke({ AI_GLOBAL_BUDGET: { decide: async () => ({ allow: true }) } }, validBody);
if (missingSecrets.status !== 503 || anthropicCalled(missingSecrets.calls)) {
  fail("AI-SECRETS", "missing AI bindings did not fail closed");
}
pass("AI-SECRETS", "missing Anthropic/Turnstile bindings fail closed with no model call");

console.log("ai-global-budget: PASS");
console.log("GLOBAL_AI_BUDGET_RUNTIME_PROVEN=NO");
console.log("GLOBAL_AI_WITHOUT_BUDGET_GATE=DENIED");
console.log("UPSTREAM_AI_CALL_WITHOUT_GLOBAL_ALLOW=NO");
console.log("AI_PER_ISOLATE_LIMIT_CLASSIFIED=SUPPLEMENTAL_NOT_GLOBAL");
