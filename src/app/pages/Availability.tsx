import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { CheckCircle, MapPin, Radio, Send } from "lucide-react";
import TurnstileWidget, { type TurnstileWidgetHandle } from "../components/TurnstileWidget";
import LegalNoticeLinks from "../components/LegalNoticeLinks";
import { submitPublicForm } from "../lib/publicForms";

const PARISHES = [
  "Kingston", "St. Andrew", "St. Thomas", "Portland", "St. Mary",
  "St. Ann", "Trelawny", "St. James", "Hanover", "Westmoreland",
  "St. Elizabeth", "Manchester", "Clarendon", "St. Catherine",
];
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9(). -]{7,25}$/;

const INITIAL_FORM = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  parish: "",
  propertyType: "",
  interest: "",
};

export default function Availability() {
  const [form, setForm] = useState(INITIAL_FORM);
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

  const update = (field: keyof typeof INITIAL_FORM, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (submitted) setSubmitted(false);
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const fullName = form.fullName.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();
    const address = form.address.trim();
    const parish = form.parish.trim();

    if (fullName.length < 2 || fullName.length > 120) {
      setSubmitError("Enter a full name between 2 and 120 characters.");
      return;
    }
    if (!email && !phone) {
      setSubmitError("Enter an email address or phone number.");
      return;
    }
    if (email && (!EMAIL_PATTERN.test(email) || email.length > 254)) {
      setSubmitError("Enter a valid email address.");
      return;
    }
    if (phone && !PHONE_PATTERN.test(phone)) {
      setSubmitError("Enter a valid phone number.");
      return;
    }
    if (address.length < 5 || address.length > 500) {
      setSubmitError("Enter a service address between 5 and 500 characters.");
      return;
    }
    if (!parish || !form.propertyType || !form.interest) {
      setSubmitError("Select a parish, property type and service interest.");
      return;
    }
    if (!turnstileToken) {
      setSubmitError("Complete the security check before submitting.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await submitPublicForm("pre_registration", turnstileToken, {
        full_name: fullName,
        email: email || null,
        phone: phone || null,
        address,
        parish,
        property_type: form.propertyType,
        interest: form.interest,
      });
      setForm(INITIAL_FORM);
      setSubmitted(true);
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Your address could not be registered. Please try again.");
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
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}><Radio size={26} color="#A3E635" /></div>
        <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3rem)", color: "#fff", marginBottom: "12px" }}>
          Check Future Availability
        </h1>
        <p style={{ fontFamily: '"Nunito", sans-serif', color: "rgba(255,255,255,0.5)", maxWidth: "580px", margin: "0 auto" }}>
          Register a service address so Tellinex can assess demand and notify you if planning reaches your area. This is not a live coverage check, not a contract, and not an installation booking.
        </p>
      </div>

      <div style={{ background: "rgba(0,199,177,0.03)", border: "1px solid rgba(0,199,177,0.18)", borderRadius: "10px", padding: "32px", backdropFilter: "blur(8px)" }}>
        {submitted && (
          <div role="status" style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "14px", marginBottom: "20px", borderRadius: "6px", background: "rgba(163,230,53,0.08)", border: "1px solid rgba(163,230,53,0.25)", color: "#d9ff9a" }}>
            <CheckCircle size={20} />
            <span>Your address was registered for planning review. We will use the contact details supplied for relevant availability updates.</span>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div><label htmlFor="avail-full-name" style={labelStyle}>Full name *</label><input id="avail-full-name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required maxLength={120} style={inputStyle} /></div>
            <div><label htmlFor="avail-parish" style={labelStyle}>Parish *</label><select id="avail-parish" value={form.parish} onChange={(e) => update("parish", e.target.value)} required style={{ ...inputStyle, appearance: "none" }}><option value="" disabled>Select parish</option>{PARISHES.map((parish) => <option key={parish} value={parish}>{parish}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div><label htmlFor="avail-email" style={labelStyle}>Email</label><input id="avail-email" value={form.email} onChange={(e) => update("email", e.target.value)} type="email" maxLength={254} style={inputStyle} /></div>
            <div><label htmlFor="avail-phone" style={labelStyle}>Phone</label><input id="avail-phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} type="tel" maxLength={25} style={inputStyle} /></div>
          </div>
          <div className="mb-4"><label htmlFor="avail-address" style={labelStyle}><MapPin size={12} style={{ display: "inline", marginRight: "4px" }} />Service address *</label><textarea id="avail-address" value={form.address} onChange={(e) => update("address", e.target.value)} required minLength={5} maxLength={500} rows={3} style={{ ...inputStyle, resize: "vertical" }} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div><label htmlFor="avail-property-type" style={labelStyle}>Property type *</label><select id="avail-property-type" value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)} required style={{ ...inputStyle, appearance: "none" }}><option value="" disabled>Select type</option><option value="house">House</option><option value="apartment">Apartment</option><option value="business">Business</option><option value="hotel">Hotel</option><option value="other">Other</option></select></div>
            <div><label htmlFor="avail-interest" style={labelStyle}>Interest *</label><select id="avail-interest" value={form.interest} onChange={(e) => update("interest", e.target.value)} required style={{ ...inputStyle, appearance: "none" }}><option value="" disabled>Select service</option><option value="residential">Residential</option><option value="business">Business</option><option value="both">Both</option></select></div>
          </div>

          <TurnstileWidget ref={turnstileRef} action="pre_registration" onTokenChange={handleTurnstileToken} onUnavailable={handleTurnstileUnavailable} />

          {submitError && <p role="alert" aria-live="polite" style={{ color: "#ff8a8a", fontFamily: '"Nunito", sans-serif', fontSize: "0.82rem", marginBottom: "14px" }}>{submitError}</p>}

          <button type="submit" disabled={submitting || !turnstileToken} style={{ width: "100%", padding: "14px", border: "none", borderRadius: "6px", background: "#A3E635", color: "#040d14", fontFamily: '"Poppins", sans-serif', fontWeight: 700, cursor: submitting || !turnstileToken ? "not-allowed" : "pointer", opacity: submitting || !turnstileToken ? 0.65 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <Send size={16} /> {submitting ? "REGISTERING…" : "REGISTER ADDRESS"}
          </button>
        </form>
      </div>
      <LegalNoticeLinks />
    </div>
  );
}
