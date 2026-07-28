export const TURNSTILE_SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAAD_5xvo4krYggNKf";

const PUBLIC_FORM_ENDPOINT =
  "https://egztpclpcnizcdtfugsv.supabase.co/functions/v1/submit-public-form";

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
