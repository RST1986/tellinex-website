import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { Bell, CheckCircle, Send, ShieldCheck } from "lucide-react";
import TurnstileWidget, { type TurnstileWidgetHandle } from "../components/TurnstileWidget";
import LegalNoticeLinks from "../components/LegalNoticeLinks";
import { submitPublicForm } from "../lib/publicForms";

const PARISHES = [
  "", "Kingston", "St. Andrew", "St. Thomas", "Portland", "St. Mary",
  "St. Ann", "Trelawny", "St. James", "Hanover", "Westmoreland",
  "St. Elizabeth", "Manchester", "Clarendon", "St. Catherine",
];
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export default function Status() {
  const [email, setEmail] = useState("");
  const [severity, setSeverity] = useState("");
  const [parish, setParish] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  const handleTurnstileToken = useCallback((token: string | null) => {
    setTurnstileToken(token);
    if (token) setSubmitError("");
  }, []);

  const handleTurnstileUnavailable = useCallback(() => {
    setSubmitError("The security check could not load. Please refresh the page and try again.");
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalizedEmail) || normalizedEmail.length > 254) {
      setSubmitError("Enter a valid email address.");
      return;
    }
    if (parish.length > 100) {
      setSubmitError("The parish filter is invalid.");
      return;
    }
    if (!turnstileToken) {
      setSubmitError("Complete the security check before subscribing.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await submitPublicForm("status_subscription", turnstileToken, {
        email: normalizedEmail,
        min_severity: severity || null,
        parish_filter: parish || null,
      });
      setEmail("");
      setSeverity("");
      setParish("");
      setSubmitted(true);
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Your subscription could not be created. Please try again.");
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    background: "rgba(0,199,177,0.05)",
    border: "1px solid rgba(0,199,177,0.25)",
    borderRadius: "6px",
    color: "#fff",
    fontFamily: '"Nunito", sans-serif',
    fontSize: "0.88rem",
    outline: "none",
  };
  const labelStyle: CSSProperties = {
    display: "block",
    fontFamily: '"Nunito", sans-serif',
    fontSize: "0.78rem",
    color: "rgba(255,255,255,0.55)",
    marginBottom: "6px",
  };

  return (
    <div className="px-4 sm:px-6 py-20 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "14px" }}><Bell size={25} color="#00C7B1" /><ShieldCheck size={25} color="#A3E635" /></div>
        <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3rem)", color: "#fff", marginBottom: "12px" }}>
          Network Status Notifications
        </h1>
        <p style={{ fontFamily: '"Nunito", sans-serif', color: "rgba(255,255,255,0.5)", maxWidth: "580px", margin: "0 auto" }}>
          Request notifications about future service-status updates. This is not a national live status feed and not a service-level commitment.
        </p>
      </div>

      <div style={{ background: "rgba(0,199,177,0.03)", border: "1px solid rgba(0,199,177,0.18)", borderRadius: "10px", padding: "32px", backdropFilter: "blur(8px)" }}>
        {submitted && (
          <div role="status" style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "14px", marginBottom: "20px", borderRadius: "6px", background: "rgba(163,230,53,0.08)", border: "1px solid rgba(163,230,53,0.25)", color: "#d9ff9a" }}>
            <CheckCircle size={20} />
            <span>Your notification request was received. Confirmation and unsubscribe controls will be sent through the address supplied.</span>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="mb-4">
            <label style={labelStyle}>Email *</label>
            <input value={email} onChange={(event) => { setEmail(event.target.value); if (submitted) setSubmitted(false); }} type="email" required maxLength={254} placeholder="you@example.com" style={inputStyle} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label style={labelStyle}>Minimum event level</label>
              <select value={severity} onChange={(event) => setSeverity(event.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">All status updates</option>
                <option value="planned">Planned maintenance and above</option>
                <option value="degraded">Degraded service and outages</option>
                <option value="outage">Outages only</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Parish filter</label>
              <select value={parish} onChange={(event) => setParish(event.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                {PARISHES.map((item) => <option key={item || "all"} value={item}>{item || "All parishes"}</option>)}
              </select>
            </div>
          </div>

          <TurnstileWidget ref={turnstileRef} action="status_subscription" onTokenChange={handleTurnstileToken} onUnavailable={handleTurnstileUnavailable} />

          {submitError && <p role="alert" aria-live="polite" style={{ color: "#ff8a8a", fontFamily: '"Nunito", sans-serif', fontSize: "0.82rem", marginBottom: "14px" }}>{submitError}</p>}

          <button type="submit" disabled={submitting || !turnstileToken} style={{ width: "100%", padding: "14px", border: "none", borderRadius: "6px", background: "#00C7B1", color: "#040d14", fontFamily: '"Poppins", sans-serif', fontWeight: 700, cursor: submitting || !turnstileToken ? "not-allowed" : "pointer", opacity: submitting || !turnstileToken ? 0.65 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <Send size={16} /> {submitting ? "SUBSCRIBING…" : "SUBSCRIBE"}
          </button>
        </form>
      </div>
      <LegalNoticeLinks />
    </div>
  );
}
