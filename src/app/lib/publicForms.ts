export const TURNSTILE_SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAAD_5xvo4krYggNKf";

const DEFAULT_PUBLIC_FORM_ENDPOINT =
  "https://egztpclpcnizcdtfugsv.supabase.co/functions/v1/submit-public-form";
const PRODUCTION_FORM_HOST = "egztpclpcnizcdtfugsv.supabase.co";
const STAGING_FORM_HOST = "uygisfwvpcnzuzmrzhqz.supabase.co";
const WEBSITE_PAGES_PREVIEW_ROOT = "tellinex-website.pages.dev";
const PUBLIC_FORM_PATH = "/functions/v1/submit-public-form";
const SUPABASE_FUNCTION_HOST = /^[a-z0-9-]+\.supabase\.co$/i;

function isWebsiteBranchPreviewHost(hostname: string): boolean {
  return hostname.toLowerCase().endsWith(`.${WEBSITE_PAGES_PREVIEW_ROOT}`);
}

function assertPreviewDoesNotUseProductionEndpoint(endpoint: string): void {
  if (typeof window === "undefined") return;
  if (!isWebsiteBranchPreviewHost(window.location.hostname)) return;

  const host = new URL(endpoint).hostname.toLowerCase();
  if (host === PRODUCTION_FORM_HOST || host !== STAGING_FORM_HOST) {
    throw new PublicFormError("Preview must use the staging form endpoint.", {
      code: "preview_endpoint_mismatch",
      status: 0,
    });
  }
}

function resolvePublicFormEndpoint(configuredEndpoint: string | undefined): string {
  const candidate = configuredEndpoint?.trim() || DEFAULT_PUBLIC_FORM_ENDPOINT;

  let endpoint: URL;
  try {
    endpoint = new URL(candidate);
  } catch {
    throw new Error("VITE_PUBLIC_FORM_ENDPOINT must be a valid HTTPS URL.");
  }

  if (
    endpoint.protocol !== "https:" ||
    endpoint.username !== "" ||
    endpoint.password !== "" ||
    endpoint.port !== "" ||
    endpoint.search !== "" ||
    endpoint.hash !== "" ||
    !SUPABASE_FUNCTION_HOST.test(endpoint.hostname) ||
    endpoint.pathname !== PUBLIC_FORM_PATH
  ) {
    throw new Error(
      "VITE_PUBLIC_FORM_ENDPOINT must be an HTTPS Supabase submit-public-form endpoint without credentials, port, query, or fragment.",
    );
  }

  return endpoint.toString();
}

export const PUBLIC_FORM_ENDPOINT = resolvePublicFormEndpoint(
  import.meta.env.VITE_PUBLIC_FORM_ENDPOINT,
);

export type PublicFormType =
  | "access_request"
  | "customer_review"
  | "pre_registration"
  | "quote_request"
  | "registration"
  | "status_subscription";

type PublicFormErrorPayload = {
  code?: string;
  message?: string;
};

export class PublicFormError extends Error {
  readonly code: string;
  readonly status: number;
  readonly retryAfterSeconds: number | null;

  constructor(
    message: string,
    options: { code?: string; status: number; retryAfterSeconds?: number | null },
  ) {
    super(message);
    this.name = "PublicFormError";
    this.code = options.code || "submission_failed";
    this.status = options.status;
    this.retryAfterSeconds = options.retryAfterSeconds ?? null;
  }
}

export async function submitPublicForm(
  formType: PublicFormType,
  turnstileToken: string,
  payload: Record<string, unknown>,
): Promise<void> {
  assertPreviewDoesNotUseProductionEndpoint(PUBLIC_FORM_ENDPOINT);

  const response = await fetch(PUBLIC_FORM_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      form_type: formType,
      turnstile_token: turnstileToken,
      payload,
    }),
  });

  if (response.ok) return;

  let errorPayload: PublicFormErrorPayload = {};
  try {
    errorPayload = (await response.json()) as PublicFormErrorPayload;
  } catch {
    // The HTTP status still provides a safe fallback when no JSON is returned.
  }

  const retryAfterHeader = Number.parseInt(response.headers.get("Retry-After") || "", 10);
  const retryAfterSeconds =
    Number.isFinite(retryAfterHeader) && retryAfterHeader > 0 ? retryAfterHeader : null;

  let message = errorPayload.message || "We could not submit the form. Please try again.";
  if (response.status === 429) {
    message = retryAfterSeconds
      ? `Too many submissions. Please try again in ${retryAfterSeconds} seconds.`
      : "Too many submissions. Please try again later.";
  } else if (
    errorPayload.code === "turnstile_failed" ||
    errorPayload.code === "turnstile_expired"
  ) {
    message = "The security check expired or was not accepted. Please complete it again.";
  }

  throw new PublicFormError(message, {
    code: errorPayload.code,
    status: response.status,
    retryAfterSeconds,
  });
}
