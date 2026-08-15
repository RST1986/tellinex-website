// Authoritative global AI budget contract.
// This module does not create Cloudflare resources.
// Per-isolate Maps are not a global budget and must not be used as one.
// A public request may reach the model only after an explicit allow decision
// from env.AI_GLOBAL_BUDGET. Missing, unavailable, or malformed authority fails closed.

export const GLOBAL_BUDGET_BINDING = "AI_GLOBAL_BUDGET";

export async function decideGlobalBudget(env, requestContext) {
  const authority = env?.[GLOBAL_BUDGET_BINDING];
  if (authority == null) {
    return {
      allowed: false,
      status: 503,
      code: "global_budget_authority_unavailable",
    };
  }

  let decision;
  try {
    if (typeof authority.fetch === "function") {
      const response = await authority.fetch(new Request("https://tellinex-ai-budget.internal/decide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tokens: requestContext.tokens,
          key: requestContext.key,
        }),
      }));
      if (!response.ok) {
        return { allowed: false, status: 503, code: "global_budget_authority_unavailable" };
      }
      try {
        decision = await response.json();
      } catch {
        return { allowed: false, status: 503, code: "global_budget_malformed" };
      }
    } else if (typeof authority.decide === "function") {
      decision = await authority.decide(requestContext);
    } else {
      return { allowed: false, status: 503, code: "global_budget_authority_unavailable" };
    }
  } catch {
    return { allowed: false, status: 503, code: "global_budget_authority_unavailable" };
  }

  if (decision == null || typeof decision !== "object" || Array.isArray(decision)) {
    return { allowed: false, status: 503, code: "global_budget_malformed" };
  }
  if (decision.allow === true) {
    return { allowed: true, status: 200, code: "global_budget_allow" };
  }
  if (decision.allow === false) {
    return { allowed: false, status: 503, code: "global_budget_denied" };
  }
  return { allowed: false, status: 503, code: "global_budget_malformed" };
}
