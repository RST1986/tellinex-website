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
  return fact.public && fact.class !== "UNVERIFIED" && fact.class !== "UNVERIFIED_NOT_PUBLIC" && fact.class !== "DRAFT";
}

export function publicNumericClaims(): CommercialFact<string>[] {
  return [SYMMETRICAL_SPEED_INTENT, UPTIME_TARGET, CURRENT_COVERAGE, NATIONAL_EXPANSION].filter(isPublicFact);
}
