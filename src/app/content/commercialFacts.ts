/**
 * Canonical commercial-truth registry for the public Tellinex website.
 * PLANS != LIVE SERVICES. TARGETS != CURRENT COVERAGE.
 * DESIGN INTENT != GUARANTEE. DRAFT PRICE != CONTRACTUAL PRICE.
 * AI != AUTHORITY. PUBLIC WEBSITE != CONTROL PLANE.
 *
 * Every quantitative public claim must be sourced from this file.
 * UNVERIFIED and DRAFT values must not be presented as current fact or commitment.
 */

export const FACT_CLASSES = [
  "CURRENT_VERIFIED",
  "PLANNED",
  "TARGET",
  "DRAFT",
  "UNVERIFIED",
  "UNVERIFIED_NOT_PUBLIC",
] as const;

export type FactClass = (typeof FACT_CLASSES)[number];

export type CommercialFact<T> = {
  value: T;
  class: FactClass;
  public: boolean;
  note: string;
};

export const LAUNCH_STATE = "BUILDING_NETWORK" as const;
export const COMMERCIAL_LIVE = false;
export const PUBLIC_LAUNCH_DATE: string | null = null;
export const FIRST_CLAIM_REQUIRES_INDEPENDENT_EVIDENCE = true;
export const LEGAL_REVIEW_REQUIRED = true;
export const REVIEWS_MODE = "PRE_LAUNCH" as const;
export const PRICING_GOVERNANCE = "DRAFT_PRICE_NOT_CONTRACTUAL" as const;
export const SLA_GOVERNANCE = "UNAPPROVED_NOT_PUBLIC_COMMITMENT" as const;

export const PUBLIC_AUTO_HEAL_ENDPOINTS = 0;
export const PUBLIC_REDEPLOY_ENDPOINTS = 0;
export const PUBLIC_TCC_CONTROL_ENDPOINTS = 0;

export const COMPANY = {
  legalName: "Tellinex Limited",
  marketName: "Tellinex",
  geography: "Jamaica",
  hqCity: "Kingston, Jamaica",
  publicEmail: "info@tellinex.com",
  enterpriseEmail: "sales@tellinex.com",
  website: "https://tellinex.com",
  companyNumber: null,
  registeredAddress: null,
  licenceNumber: null,
} as const;

export const POSITIONING: CommercialFact<string> = {
  value:
    "Tellinex is building resilient digital infrastructure in Jamaica — a future fibre operator, enterprise connectivity, wholesale transport, and digital-infrastructure platform. Not merely a generic ISP.",
  class: "CURRENT_VERIFIED",
  public: true,
  note: "Strategic positioning. Does not assert live retail service or national coverage.",
};

export const PUBLIC_HEADLINE: CommercialFact<string> = {
  value: "Building resilient digital infrastructure in Jamaica",
  class: "CURRENT_VERIFIED",
  public: true,
  note: "Homepage headline. Does not assert live retail service or national coverage.",
};

export const NETWORK_DESIGN_PRINCIPLE: CommercialFact<string> = {
  value:
    "Network design principle: underground, micro-trenched fibre intended to reduce storm exposure compared with aerial plant.",
  class: "PLANNED",
  public: true,
  note: "DESIGN INTENT != CURRENTLY BUILT ASSET. Do not present as a completed national network.",
};

export const CURRENT_COVERAGE: CommercialFact<string> = {
  value: "Coverage is not a live national service. Public interest registration is open while the network is being built.",
  class: "CURRENT_VERIFIED",
  public: true,
  note: "No parish-level live coverage map is approved for public assertion.",
};

export const NATIONAL_EXPANSION: CommercialFact<string> = {
  value: "National expansion across Jamaica is a planned programme, not current coverage.",
  class: "PLANNED",
  public: true,
  note: "Do not render as '14 parishes covered'.",
};

export const PILOT_CORRIDOR: CommercialFact<string> = {
  value: "New Kingston is the intended first build corridor.",
  class: "PLANNED",
  public: true,
  note: "Pilot intent. Not a live homes-passed figure.",
};

export const HOMES_PASSED_425K: CommercialFact<string> = {
  value: "425K",
  class: "UNVERIFIED_NOT_PUBLIC",
  public: false,
  note: "Conflicts with other unpublished targets. No independent evidence in this repository. Do not publish.",
};

export const HOMES_PASSED_180000: CommercialFact<string> = {
  value: "180000",
  class: "TARGET",
  public: false,
  note: "Long-range target, not current homes passed. Do not publish as a live figure. Conflict with 425K is unresolved.",
};

export const PARISHES_COVERED_CLAIM: CommercialFact<string> = {
  value: "14 parishes covered",
  class: "UNVERIFIED_NOT_PUBLIC",
  public: false,
  note: "Must not appear as current coverage.",
};

export const SYMMETRICAL_SPEED_INTENT: CommercialFact<string> = {
  value: "Gigabit-class symmetrical fibre is a design intent for future products.",
  class: "PLANNED",
  public: true,
  note: "Not a live service guarantee.",
};

export const UPTIME_TARGET: CommercialFact<string> = {
  value: "99.99%",
  class: "TARGET",
  public: true,
  note: "Engineering target only. Not an approved product commitment.",
};

export const HURRICANE_ABSOLUTE_CLAIMS_ALLOWED = false;
export const FIRST_IN_JAMAICA_CLAIM_ALLOWED = false;

export const RESILIENCE_PUBLIC_WORDING: CommercialFact<string> = {
  value:
    "We are designing underground fibre so Jamaica can have more resilient connectivity. This is a design principle, not a hurricane-proof or Category 5 guarantee.",
  class: "PLANNED",
  public: true,
  note: "Defensible resilience positioning. No storm-absolute language.",
};

export const DRAFT_RESIDENTIAL_PRICE: CommercialFact<string> = {
  value: "US$45/month",
  class: "DRAFT",
  public: false,
  note: "DRAFT PRICE != CONTRACTUAL OFFER. Do not publish as a price.",
};

export const DRAFT_BUSINESS_PRICE: CommercialFact<string> = {
  value: "US$99/month",
  class: "DRAFT",
  public: false,
  note: "DRAFT PRICE != CONTRACTUAL OFFER. Do not publish as a price.",
};

export const SLA_BUSINESS_DRAFT: CommercialFact<string> = {
  value: "99.9% uptime SLA",
  class: "DRAFT",
  public: false,
  note: "Not an APPROVED_PRODUCT_COMMITMENT.",
};

export const SLA_ENTERPRISE_TARGET: CommercialFact<string> = {
  value: "99.99% uptime target",
  class: "TARGET",
  public: false,
  note: "Target, not a public contractual commitment.",
};

export const PRICING_PUBLIC_WORDING = "PRICING_TO_BE_CONFIRMED" as const;
export const PRICING_CTA_REGISTER = "REGISTER_FOR_LAUNCH_UPDATES" as const;
export const PRICING_CTA_ENTERPRISE = "CONTACT_ENTERPRISE_TEAM" as const;

export const REGISTRATION_IS_INTEREST_ONLY = true;
export const SUCCESS_LANGUAGE = "REQUEST_RECEIVED" as const;

export const BIOGRAPHIES = {
  omarGentles: {
    class: "FOUNDER_PROVIDED_UNVERIFIED" as const,
    public: true,
    note: "Biography supplied by founders. Certifications and titles are not independently evidenced in this repository. Do not invent corrections.",
  },
  ruiSantos: {
    class: "FOUNDER_PROVIDED_UNVERIFIED" as const,
    public: true,
    note: "Biography supplied by founders. Historical FTTH claims are not independently evidenced here. Do not invent corrections.",
  },
} as const;

export const FUNDRAISING_CLAIMS_PUBLIC = false;

export const SEO = {
  title: "Tellinex — Building resilient digital infrastructure in Jamaica",
  description:
    "Tellinex is building underground fibre and digital infrastructure in Jamaica. Network build in progress. Register interest for launch updates. Pricing and coverage will be confirmed before service activation.",
  canonical: "https://tellinex.com/",
  ogTitle: "Tellinex — Resilient digital infrastructure for Jamaica",
  ogDescription:
    "Future fibre operator, enterprise connectivity, and wholesale transport platform. Building the network. Not a live national service.",
} as const;

export function isPublicFact(fact: CommercialFact<unknown>): boolean {
  if (!fact.public) return false;
  const factClass = fact.class;
  switch (factClass) {
    case "CURRENT_VERIFIED":
    case "PLANNED":
    case "TARGET":
      return true;
    case "DRAFT":
    case "UNVERIFIED":
    case "UNVERIFIED_NOT_PUBLIC":
      return false;
    default: {
      const exhaustive: never = factClass;
      throw new Error(`Unknown fact class: ${String(exhaustive)}`);
    }
  }
}

export function publicNumericClaims(): CommercialFact<string>[] {
  return [SYMMETRICAL_SPEED_INTENT, UPTIME_TARGET, CURRENT_COVERAGE, NATIONAL_EXPANSION].filter(isPublicFact);
}

export const GOVERNED_STRING_FACTS = {
  POSITIONING,
  PUBLIC_HEADLINE,
  NETWORK_DESIGN_PRINCIPLE,
  CURRENT_COVERAGE,
  NATIONAL_EXPANSION,
  PILOT_CORRIDOR,
  HOMES_PASSED_425K,
  HOMES_PASSED_180000,
  PARISHES_COVERED_CLAIM,
  SYMMETRICAL_SPEED_INTENT,
  UPTIME_TARGET,
  RESILIENCE_PUBLIC_WORDING,
  DRAFT_RESIDENTIAL_PRICE,
  DRAFT_BUSINESS_PRICE,
  SLA_BUSINESS_DRAFT,
  SLA_ENTERPRISE_TARGET,
} as const;

export function looksLikeCurrentNationwideCoverage(value: string): boolean {
  return (
    /covers all/i.test(value) ||
    /14 parishes/i.test(value) ||
    /425K/i.test(value) ||
    /homes passed/i.test(value) ||
    /live gigabit/i.test(value) ||
    /now covers/i.test(value) ||
    /nationwide (live|service|coverage)/i.test(value)
  );
}

export function looksLikeStormAbsoluteAffirmation(value: string): boolean {
  const normalized = value.replace(/\s+/g, " ");
  if (/not a hurricane-proof or Category 5 guarantee/i.test(normalized)) {
    return /unstoppable|zero storm risk|hurricane-proof internet/i.test(normalized);
  }
  return (
    /hurricane-proof/i.test(normalized) ||
    /category 5/i.test(normalized) ||
    /zero storm risk/i.test(normalized) ||
    /\bunstoppable\b/i.test(normalized)
  );
}

export function looksLikePrimacyClaim(value: string): boolean {
  return (
    /first in Jamaica/i.test(value) ||
    /Jamaica's first/i.test(value) ||
    /only (underground )?fibre/i.test(value)
  );
}

export function looksLikePublicPrice(value: string): boolean {
  return (
    /US\$\s*\d/i.test(value) ||
    /per month/i.test(value) ||
    /founding member rate/i.test(value) ||
    /From US\$/i.test(value)
  );
}

export function assertCommercialRegistryInvariants(): void {
  if (LAUNCH_STATE !== "BUILDING_NETWORK") {
    throw new Error("LAUNCH_STATE_MUST_BE_BUILDING_NETWORK");
  }
  if (COMMERCIAL_LIVE !== false) {
    throw new Error("COMMERCIAL_LIVE_MUST_REMAIN_FALSE");
  }
  if (PUBLIC_LAUNCH_DATE !== null) {
    throw new Error("PUBLIC_LAUNCH_DATE_MUST_NOT_BE_FABRICATED");
  }
  if (LEGAL_REVIEW_REQUIRED !== true) {
    throw new Error("LEGAL_REVIEW_REQUIRED_MUST_REMAIN_TRUE");
  }
  if (HURRICANE_ABSOLUTE_CLAIMS_ALLOWED !== false) {
    throw new Error("HURRICANE_ABSOLUTE_CLAIMS_MUST_REMAIN_DISALLOWED");
  }
  if (FIRST_IN_JAMAICA_CLAIM_ALLOWED !== false) {
    throw new Error("FIRST_IN_JAMAICA_CLAIM_MUST_REMAIN_DISALLOWED");
  }
  if (FIRST_CLAIM_REQUIRES_INDEPENDENT_EVIDENCE !== true) {
    throw new Error("FIRST_CLAIM_REQUIRES_INDEPENDENT_EVIDENCE_MUST_REMAIN_TRUE");
  }
  if (PRICING_PUBLIC_WORDING !== "PRICING_TO_BE_CONFIRMED") {
    throw new Error("DRAFT_PRICE_MUST_NOT_BECOME_PUBLIC_WORDING");
  }
  if (looksLikePublicPrice(PRICING_PUBLIC_WORDING)) {
    throw new Error("PRICING_PUBLIC_WORDING_MUST_NOT_BE_A_PRICE");
  }
  if (PRICING_GOVERNANCE !== "DRAFT_PRICE_NOT_CONTRACTUAL") {
    throw new Error("PRICING_GOVERNANCE_MUST_REMAIN_DRAFT");
  }
  if (
    PUBLIC_AUTO_HEAL_ENDPOINTS !== 0 ||
    PUBLIC_REDEPLOY_ENDPOINTS !== 0 ||
    PUBLIC_TCC_CONTROL_ENDPOINTS !== 0
  ) {
    throw new Error("PUBLIC_CONTROL_PLANE_AUTHORITY_MUST_REMAIN_ZERO");
  }

  if (CURRENT_COVERAGE.class !== "CURRENT_VERIFIED" || CURRENT_COVERAGE.public !== true) {
    throw new Error("CURRENT_COVERAGE_MUST_REMAIN_GOVERNED_CURRENT_VERIFIED");
  }
  if (!/not a live national/i.test(CURRENT_COVERAGE.value)) {
    throw new Error("CURRENT_COVERAGE_MUST_DENY_LIVE_NATIONAL_SERVICE");
  }
  if (looksLikeCurrentNationwideCoverage(CURRENT_COVERAGE.value)) {
    throw new Error("CURRENT_COVERAGE_CANNOT_ASSERT_NATIONWIDE_LIVE_SERVICE");
  }
  if (PARISHES_COVERED_CLAIM.class !== "UNVERIFIED_NOT_PUBLIC" || PARISHES_COVERED_CLAIM.public !== false) {
    throw new Error("PARISHES_COVERED_CLAIM_CANNOT_BE_PUBLIC_AUTHORITATIVE");
  }
  if (HOMES_PASSED_425K.class !== "UNVERIFIED_NOT_PUBLIC" || HOMES_PASSED_425K.public !== false) {
    throw new Error("HOMES_PASSED_425K_CANNOT_BE_PUBLIC_AUTHORITATIVE");
  }
  if (HOMES_PASSED_180000.public !== false) {
    throw new Error("HOMES_PASSED_180000_CANNOT_BE_PUBLIC_AUTHORITATIVE");
  }
  if (DRAFT_RESIDENTIAL_PRICE.class !== "DRAFT" || DRAFT_RESIDENTIAL_PRICE.public !== false) {
    throw new Error("DRAFT_RESIDENTIAL_PRICE_CANNOT_BE_PUBLIC_AUTHORITATIVE");
  }
  if (DRAFT_BUSINESS_PRICE.class !== "DRAFT" || DRAFT_BUSINESS_PRICE.public !== false) {
    throw new Error("DRAFT_BUSINESS_PRICE_CANNOT_BE_PUBLIC_AUTHORITATIVE");
  }
  if (NATIONAL_EXPANSION.class !== "PLANNED") {
    throw new Error("NATIONAL_EXPANSION_MUST_REMAIN_PLANNED");
  }
  if (NETWORK_DESIGN_PRINCIPLE.class !== "PLANNED") {
    throw new Error("NETWORK_DESIGN_PRINCIPLE_MUST_REMAIN_PLANNED");
  }

  for (const [name, fact] of Object.entries(GOVERNED_STRING_FACTS)) {
    if (
      (fact.class === "DRAFT" || fact.class === "UNVERIFIED" || fact.class === "UNVERIFIED_NOT_PUBLIC") &&
      fact.public === true
    ) {
      throw new Error(`${name}_DRAFT_OR_UNVERIFIED_CANNOT_BE_PUBLIC_AUTHORITATIVE`);
    }
    if (fact.public && fact.class === "CURRENT_VERIFIED") {
      if (looksLikeCurrentNationwideCoverage(fact.value)) {
        throw new Error(`${name}_CURRENT_VERIFIED_CANNOT_ASSERT_NATIONWIDE_COVERAGE`);
      }
      if (looksLikeStormAbsoluteAffirmation(fact.value)) {
        throw new Error(`${name}_CANNOT_AFFIRM_STORM_ABSOLUTE`);
      }
      if (looksLikePrimacyClaim(fact.value)) {
        throw new Error(`${name}_CANNOT_AFFIRM_PRIMACY`);
      }
      if (looksLikePublicPrice(fact.value)) {
        throw new Error(`${name}_CANNOT_PUBLISH_PRICE`);
      }
    }
    if (fact.public && HURRICANE_ABSOLUTE_CLAIMS_ALLOWED === false && looksLikeStormAbsoluteAffirmation(fact.value)) {
      throw new Error(`${name}_STORM_ABSOLUTE_NOT_ALLOWED`);
    }
    if (fact.public && FIRST_IN_JAMAICA_CLAIM_ALLOWED === false && looksLikePrimacyClaim(fact.value)) {
      throw new Error(`${name}_PRIMACY_NOT_ALLOWED`);
    }
  }
}

assertCommercialRegistryInvariants();
