import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { gsap } from "gsap";
import { CheckCircle, Clock, Globe, Mail, MapPin, Send } from "lucide-react";
import TurnstileWidget, { type TurnstileWidgetHandle } from "../components/TurnstileWidget";
import LegalNoticeLinks from "../components/LegalNoticeLinks";
import { COMPANY } from "../content/commercialFacts";
import { submitPublicForm } from "../lib/publicForms";

const CONTACTS = [
  { icon: Mail, label: "General enquiries", value: COMPANY.publicEmail, href: `mailto:${COMPANY.publicEmail}`, color: "#00C7B1" },
  { icon: Mail, label: "Enterprise and wholesale", value: COMPANY.enterpriseEmail, href: `mailto:${COMPANY.enterpriseEmail}`, color: "#A3E635" },
  { icon: MapPin, label: "Location", value: COMPANY.hqCity, href: null, color: "#00C7B1" },
  { icon: Globe, label: "Website", value: "tellinex.com", href: COMPANY.website, color: "#A3E635" },
  { icon: Clock, label: "Response target", value: "We aim to review enquiries within one working day", href: null, color: "#00C7B1" },
];

const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9(). -]{7,25}$/;

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  company: "",
  subject: "",
  location: "",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".ct-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
      gsap.fromTo(".ct-card", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.3 });
      gsap.fromTo(".ct-form", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.5 });
    });
    return () => ctx.revert();
  }, []);

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

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();
    const company = form.company.trim();
    const subject = form.subject.trim();
    const location = form.location.trim();
    const message = form.message.trim();

    if (name.length < 2 || name.length > 120) {
      setSubmitError("Enter a name between 2 and 120 characters.");
      return;
    }
    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      setSubmitError("Enter a valid email address.");
      return;
    }
    if (phone && !PHONE_PATTERN.test(phone)) {
      setSubmitError("Enter a valid phone number.");
      return;
    }
    if (!subject || subject.length > 80) {
      setSubmitError("Select the type of enquiry.");
      return;
    }
    if (company.length > 200 || location.length > 500) {
      setSubmitError("Company or location is too long.");
      return;
    }
    if (message.length < 5 || message.length > 4000) {
      setSubmitError("Enter a message between 5 and 4,000 characters.");
      return;
    }
    if (!turnstileToken) {
      setSubmitError("Complete the security check before submitting.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await submitPublicForm("quote_request", turnstileToken, {
        quote_type: subject,
        customer_name: name,
        customer_email: email,
        customer_phone: phone || null,
        company_name: company || null,
        location: location || null,
        service_requested: subject,
        additional_requirements: message,
      });
      setForm(INITIAL_FORM);
      setSubmitted(true);
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Your enquiry could not be submitted. Please try again.");
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "rgba(0,199,177,0.05)",
    border: "1px solid rgba(0,199,177,0.25)",
    borderRadius: "6px",
    color: "#fff",
    fontFamily: '"Nunito", sans-serif',
    fontSize: "0.88rem",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    fontFamily: '"Nunito", sans-serif',
    fontSize: "0.78rem",
    color: "rgba(255,255,255,0.5)",
    marginBottom: "6px",
    letterSpacing: "0.03em",
  };

  const update = (field: keyof typeof INITIAL_FORM, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (submitted) setSubmitted(false);
  };

  return (
    <div className="px-4 sm:px-6 py-20 max-w-5xl mx-auto">
      <div className="text-center mb-16 ct-title">
        <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "#fff", marginBottom: "12px" }}>
          Contact
        </h1>
        <div style={{ height: "3px", width: "5rem", background: "linear-gradient(90deg, #00C7B1, #A3E635)", borderRadius: "2px", margin: "0 auto 16px", boxShadow: "0 0 12px rgba(0,199,177,0.5)" }} />
        <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "1.05rem", color: "rgba(255,255,255,0.5)", maxWidth: "560px", margin: "0 auto" }}>
          Request information through the protected enquiry gateway. Success is shown only after the server confirms the request.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.1rem", color: "#fff", marginBottom: "16px" }}>
            Contact Information
          </h3>
          <div className="flex flex-col gap-3">
            {CONTACTS.map((contact) => (
              <div key={contact.label} className="ct-card flex items-center gap-3" style={{ background: "rgba(0,199,177,0.03)", border: `1px solid ${contact.color}18`, borderRadius: "8px", padding: "16px 20px", backdropFilter: "blur(6px)" }}>
                <contact.icon size={20} style={{ color: contact.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{contact.label}</div>
                  {contact.href ? (
                    <a href={contact.href} style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.92rem", color: "#fff", fontWeight: 600, textDecoration: "none" }}>{contact.value}</a>
                  ) : (
                    <div style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.92rem", color: "#fff", fontWeight: 600 }}>{contact.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ct-form" style={{ background: "rgba(0,199,177,0.03)", border: "1px solid rgba(0,199,177,0.18)", borderRadius: "10px", padding: "32px", backdropFilter: "blur(8px)" }}>
          <h3 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.1rem", color: "#fff", marginBottom: "20px" }}>
            Request Information
          </h3>

          {submitted && (
            <div role="status" style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "14px", marginBottom: "18px", borderRadius: "6px", background: "rgba(163,230,53,0.08)", border: "1px solid rgba(163,230,53,0.25)", color: "#d9ff9a" }}>
              <CheckCircle size={20} />
              <span>REQUEST RECEIVED. The gateway confirmed your enquiry. This is not a service activation and not a contract.</span>
            </div>
          )}

          <form onSubmit={submit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div><label htmlFor="contact-name" style={labelStyle}>Name *</label><input id="contact-name" value={form.name} onChange={(e) => update("name", e.target.value)} required maxLength={120} style={inputStyle} /></div>
              <div><label htmlFor="contact-email" style={labelStyle}>Email *</label><input id="contact-email" value={form.email} onChange={(e) => update("email", e.target.value)} type="email" required maxLength={254} style={inputStyle} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div><label htmlFor="contact-phone" style={labelStyle}>Phone</label><input id="contact-phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} type="tel" maxLength={25} style={inputStyle} /></div>
              <div><label htmlFor="contact-company" style={labelStyle}>Company</label><input id="contact-company" value={form.company} onChange={(e) => update("company", e.target.value)} maxLength={200} style={inputStyle} /></div>
            </div>
            <div className="mb-4">
              <label htmlFor="contact-enquiry-type" style={labelStyle}>Enquiry type *</label>
              <select id="contact-enquiry-type" value={form.subject} onChange={(e) => update("subject", e.target.value)} required style={{ ...inputStyle, appearance: "none" }}>
                <option value="" disabled>Select an enquiry type</option>
                <option value="residential">Residential service</option>
                <option value="business">Business service</option>
                <option value="enterprise">Enterprise or wholesale</option>
                <option value="government">Government services</option>
                <option value="partnership">Partnership opportunity</option>
                <option value="other">Other enquiry</option>
              </select>
            </div>
            <div className="mb-4"><label htmlFor="contact-location" style={labelStyle}>Service location</label><input id="contact-location" value={form.location} onChange={(e) => update("location", e.target.value)} maxLength={500} placeholder="Community, parish or site address" style={inputStyle} /></div>
            <div className="mb-5"><label htmlFor="contact-requirements" style={labelStyle}>Requirements *</label><textarea id="contact-requirements" value={form.message} onChange={(e) => update("message", e.target.value)} required minLength={5} maxLength={4000} rows={5} style={{ ...inputStyle, resize: "vertical" }} /></div>

            <TurnstileWidget ref={turnstileRef} action="quote_request" onTokenChange={handleTurnstileToken} onUnavailable={handleTurnstileUnavailable} />

            {submitError && <p role="alert" aria-live="polite" style={{ color: "#ff8a8a", fontFamily: '"Nunito", sans-serif', fontSize: "0.82rem", marginBottom: "14px" }}>{submitError}</p>}

            <button type="submit" disabled={submitting || !turnstileToken} style={{ width: "100%", padding: "14px", background: "#A3E635", color: "#040d14", fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "6px", border: "none", cursor: submitting || !turnstileToken ? "not-allowed" : "pointer", opacity: submitting || !turnstileToken ? 0.65 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <Send size={16} /> {submitting ? "SENDING…" : "SEND REQUEST"}
            </button>
          </form>
        </div>
      </div>
      <LegalNoticeLinks />
    </div>
  );
}
