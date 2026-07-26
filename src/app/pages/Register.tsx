import { useEffect, useRef, useState, type FormEvent } from "react";
import { gsap } from "gsap";
import { AlertCircle, CheckCircle, Mail, MapPin, MessageSquare, Phone, Signal, User } from "lucide-react";

const SB_URL = "https://egztpclpcnizcdtfugsv.supabase.co/rest/v1";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnenRwY2xwY25pemNkdGZ1Z3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODYwNTYsImV4cCI6MjA1ODY2MDUxMn0.rY5yZ1zPNEW4bD2tU0HhYb5qJ_LCNeEJOqy9F7HnGXk";
const API_HEADERS = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

const PARISHES = [
  "Kingston", "St. Andrew", "St. Thomas", "Portland", "St. Mary",
  "St. Ann", "Trelawny", "St. James", "Hanover", "Westmoreland",
  "St. Elizabeth", "Manchester", "Clarendon", "St. Catherine",
];
const PROVIDERS = ["Flow", "Digicel", "Other", "None"];
const SPEND_RANGES = ["Under J$3,000", "J$3,000–5,000", "J$5,000–8,000", "J$8,000–12,000", "Over J$12,000"];
const PRIORITIES = ["Faster speeds", "Lower price", "Better reliability", "Hurricane resilience", "Better customer service", "Symmetrical upload/download"];
const REGISTRATION_TYPES = ["residential", "business", "both"] as const;
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9(). -]{7,25}$/;

type RegistrationForm = {
  fullName: string;
  email: string;
  phone: string;
  parish: string;
  community: string;
  type: string;
  provider: string;
  monthlySpend: string;
  priorities: string[];
  comments: string;
};

type ApiError = { code?: string; message?: string; hint?: string };

const INITIAL_FORM: RegistrationForm = {
  fullName: "",
  email: "",
  phone: "",
  parish: "",
  community: "",
  type: "",
  provider: "",
  monthlySpend: "",
  priorities: [],
  comments: "",
};

function validateForm(form: RegistrationForm): string | null {
  const fullName = form.fullName.trim();
  const email = form.email.trim().toLowerCase();
  const phone = form.phone.trim();
  const parish = form.parish.trim();
  const community = form.community.trim();
  const provider = form.provider.trim();
  const monthlySpend = form.monthlySpend.trim();
  const comments = form.comments.trim();

  if (fullName.length < 2 || fullName.length > 120) return "Enter a full name between 2 and 120 characters.";
  if (!EMAIL_PATTERN.test(email) || email.length > 254) return "Enter a valid email address.";
  if (phone && !PHONE_PATTERN.test(phone)) return "Enter a valid phone number.";
  if (!parish || parish.length > 100) return "Select a valid parish.";
  if (community.length > 200) return "Community must be 200 characters or fewer.";
  if (!REGISTRATION_TYPES.includes(form.type as (typeof REGISTRATION_TYPES)[number])) return "Select Residential, Business, or Both.";
  if (provider.length > 160) return "Provider must be 160 characters or fewer.";
  if (monthlySpend.length > 80) return "Monthly spend must be 80 characters or fewer.";
  if (form.priorities.length > 10) return "Select no more than 10 priorities.";
  if (comments.length > 4000) return "Comments must be 4,000 characters or fewer.";
  return null;
}

async function readApiError(response: Response): Promise<ApiError> {
  try {
    return (await response.json()) as ApiError;
  } catch {
    return {};
  }
}

export default function Register() {
  const [form, setForm] = useState<RegistrationForm>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".reg-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
      gsap.fromTo(".reg-form", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.3 });
    });
    return () => ctx.revert();
  }, []);

  const updateField = <K extends keyof RegistrationForm>(field: K, value: RegistrationForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const togglePriority = (priority: string) => {
    setForm((current) => ({
      ...current,
      priorities: current.priorities.includes(priority)
        ? current.priorities.filter((item) => item !== priority)
        : [...current.priorities, priority],
    }));
  };

  const showSuccess = () => {
    if (!formRef.current) {
      setSubmitted(true);
      return;
    }
    gsap.to(formRef.current, { opacity: 0, y: -20, duration: 0.4, onComplete: () => setSubmitted(true) });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitError(null);
    const validationError = validateForm(form);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${SB_URL}/registrations`, {
        method: "POST",
        headers: { ...API_HEADERS, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          full_name: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || null,
          parish: form.parish.trim(),
          community: form.community.trim() || null,
          type: form.type,
          provider: form.provider.trim() || null,
          monthly_spend: form.monthlySpend.trim() || null,
          priorities: form.priorities,
          comments: form.comments.trim() || null,
        }),
      });

      if (!response.ok) {
        const apiError = await readApiError(response);
        const isRateLimited = response.status === 429 || apiError.code === "rate_limited";
        if (isRateLimited) {
          const retryAfter = response.headers.get("Retry-After");
          throw new Error(retryAfter ? `Too many registration attempts. Please try again in ${retryAfter} seconds.` : "Too many registration attempts. Please wait and try again.");
        }
        if (response.status === 400 || apiError.code === "22023") {
          throw new Error("Some registration details are invalid. Review the form and try again.");
        }
        throw new Error("We could not save your registration. Please try again.");
      }

      showSuccess();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We could not save your registration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", background: "rgba(0,199,177,0.05)", border: "1px solid rgba(0,199,177,0.25)", borderRadius: "6px", color: "#fff", fontFamily: '"Nunito", sans-serif', fontSize: "0.88rem", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontFamily: '"Nunito", sans-serif', fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", marginBottom: "6px", letterSpacing: "0.03em",
  };
  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300C7B1' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "32px",
  };
  const focusInput = (element: HTMLInputElement | HTMLTextAreaElement) => {
    element.style.borderColor = "rgba(0,199,177,0.7)";
    element.style.boxShadow = "0 0 12px rgba(0,199,177,0.15)";
  };
  const blurInput = (element: HTMLInputElement | HTMLTextAreaElement) => {
    element.style.borderColor = "rgba(0,199,177,0.25)";
    element.style.boxShadow = "none";
  };

  return (
    <div className="px-4 sm:px-6 py-20 max-w-2xl mx-auto">
      <div className="text-center mb-12 reg-title">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Signal className="w-4 h-4 text-[#A3E635]" />
          <span style={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.25em", color: "#A3E635", textTransform: "uppercase", border: "1px solid rgba(163,230,53,0.4)", padding: "3px 12px", borderRadius: "2px", background: "rgba(163,230,53,0.06)" }}>EARLY ACCESS — FOUNDING MEMBERS</span>
          <Signal className="w-4 h-4 text-[#A3E635]" />
        </div>
        <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "clamp(1.8rem, 5vw, 2.8rem)", color: "#fff", marginBottom: "12px" }}>Register Your Interest</h1>
        <div style={{ height: "3px", width: "5rem", background: "linear-gradient(90deg, #00C7B1, #A3E635)", borderRadius: "2px", margin: "0 auto 16px", boxShadow: "0 0 12px rgba(0,199,177,0.5)" }} />
        <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "1rem", color: "rgba(255,255,255,0.5)", maxWidth: "480px", margin: "0 auto" }}>Be among the first to connect when Tellinex launches in your parish. No obligation — just tell us where you are and what you need.</p>
      </div>

      <div className="text-center mb-8" style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#00C7B1" }}>
        <span style={{ textShadow: "0 0 10px rgba(0,199,177,0.4)" }}>347+</span>
        <span style={{ color: "rgba(255,255,255,0.35)", marginLeft: "6px" }}>Jamaicans already registered</span>
      </div>

      {!submitted ? (
        <div ref={formRef} className="reg-form">
          <form onSubmit={handleSubmit} className="relative" style={{ background: "rgba(0,199,177,0.03)", border: "1px solid rgba(0,199,177,0.18)", borderRadius: "10px", padding: "32px", backdropFilter: "blur(8px)" }}>
            <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label style={labelStyle}><User size={12} style={{ display: "inline", marginRight: "4px" }} />Full name *</label>
                <input type="text" required minLength={2} maxLength={120} autoComplete="name" placeholder="Your name" value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} style={inputStyle} onFocus={(event) => focusInput(event.currentTarget)} onBlur={(event) => blurInput(event.currentTarget)} />
              </div>
              <div>
                <label style={labelStyle}><Mail size={12} style={{ display: "inline", marginRight: "4px" }} />Email *</label>
                <input type="email" required maxLength={254} autoComplete="email" placeholder="your@email.com" value={form.email} onChange={(event) => updateField("email", event.target.value)} style={inputStyle} onFocus={(event) => focusInput(event.currentTarget)} onBlur={(event) => blurInput(event.currentTarget)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label style={labelStyle}><Phone size={12} style={{ display: "inline", marginRight: "4px" }} />Phone</label>
                <input type="tel" maxLength={25} autoComplete="tel" placeholder="+1-876-..." value={form.phone} onChange={(event) => updateField("phone", event.target.value)} style={inputStyle} onFocus={(event) => focusInput(event.currentTarget)} onBlur={(event) => blurInput(event.currentTarget)} />
              </div>
              <div>
                <label style={labelStyle}><MapPin size={12} style={{ display: "inline", marginRight: "4px" }} />Parish *</label>
                <select required style={selectStyle} value={form.parish} onChange={(event) => updateField("parish", event.target.value)}>
                  <option value="" disabled>Select your parish</option>
                  {PARISHES.map((parish) => <option key={parish} value={parish}>{parish}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label style={labelStyle}>Community / Neighbourhood</label>
                <input type="text" maxLength={200} autoComplete="address-level3" placeholder="e.g. New Kingston, Half Way Tree" value={form.community} onChange={(event) => updateField("community", event.target.value)} style={inputStyle} onFocus={(event) => focusInput(event.currentTarget)} onBlur={(event) => blurInput(event.currentTarget)} />
              </div>
              <div>
                <label style={labelStyle}>Type *</label>
                <select required style={selectStyle} value={form.type} onChange={(event) => updateField("type", event.target.value)}>
                  <option value="" disabled>Residential or Business?</option>
                  <option value="residential">Residential</option>
                  <option value="business">Business</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label style={labelStyle}>Current provider</label>
                <select style={selectStyle} value={form.provider} onChange={(event) => updateField("provider", event.target.value)}>
                  <option value="">Who do you use now?</option>
                  {PROVIDERS.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Monthly spend</label>
                <select style={selectStyle} value={form.monthlySpend} onChange={(event) => updateField("monthlySpend", event.target.value)}>
                  <option value="">What do you pay now?</option>
                  {SPEND_RANGES.map((range) => <option key={range} value={range}>{range}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-5">
              <label style={labelStyle}>What matters most to you? (pick all that apply)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {PRIORITIES.map((priority) => (
                  <label key={priority} className="flex items-center gap-2 cursor-pointer" style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", padding: "6px 10px", border: "1px solid rgba(0,199,177,0.12)", borderRadius: "5px", background: "rgba(0,199,177,0.02)", transition: "border-color 0.2s" }}>
                    <input type="checkbox" value={priority} checked={form.priorities.includes(priority)} onChange={() => togglePriority(priority)} style={{ accentColor: "#00C7B1", width: "14px", height: "14px" }} />
                    {priority}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label style={labelStyle}><MessageSquare size={12} style={{ display: "inline", marginRight: "4px" }} />Anything else?</label>
              <textarea rows={3} maxLength={4000} placeholder="Tell us what you need from your internet..." value={form.comments} onChange={(event) => updateField("comments", event.target.value)} style={{ ...inputStyle, resize: "vertical" as const }} onFocus={(event) => focusInput(event.currentTarget)} onBlur={(event) => blurInput(event.currentTarget)} />
            </div>

            {submitError && (
              <div role="alert" aria-live="polite" style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "16px", padding: "12px 14px", border: "1px solid rgba(248,113,113,0.35)", borderRadius: "6px", background: "rgba(248,113,113,0.08)", color: "#fca5a5", fontFamily: '"Nunito", sans-serif', fontSize: "0.82rem", lineHeight: 1.5 }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{submitError}</span>
              </div>
            )}

            <button type="submit" disabled={submitting} aria-busy={submitting} style={{ width: "100%", padding: "14px", background: "#A3E635", color: "#040d14", fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "6px", border: "none", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.65 : 1, boxShadow: "0 0 20px rgba(163,230,53,0.35)", transition: "transform 0.15s, box-shadow 0.15s, opacity 0.15s" }} onMouseEnter={(event) => { if (!submitting) gsap.to(event.currentTarget, { scale: 1.02, boxShadow: "0 0 30px rgba(163,230,53,0.5)", duration: 0.2 }); }} onMouseLeave={(event) => gsap.to(event.currentTarget, { scale: 1, boxShadow: "0 0 20px rgba(163,230,53,0.35)", duration: 0.2 })}>
              {submitting ? "REGISTERING..." : "REGISTER MY INTEREST"}
            </button>

            <p className="text-center mt-3" style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.7rem", color: "rgba(255,255,255,0.25)" }}>No payment required. We'll notify you when Tellinex is available in your area.</p>
          </form>
        </div>
      ) : (
        <div className="text-center" role="status" aria-live="polite" style={{ background: "rgba(0,199,177,0.08)", border: "1px solid rgba(0,199,177,0.5)", borderRadius: "10px", padding: "48px 32px", boxShadow: "0 0 40px rgba(0,199,177,0.15)" }}>
          <CheckCircle size={48} style={{ color: "#A3E635", margin: "0 auto 16px", filter: "drop-shadow(0 0 14px rgba(163,230,53,0.6))" }} />
          <h3 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, color: "#fff", fontSize: "1.4rem", marginBottom: "8px", letterSpacing: "0.05em" }}>CONNECTION ESTABLISHED</h3>
          <p style={{ fontFamily: '"Nunito", sans-serif', color: "rgba(255,255,255,0.5)", fontSize: "0.95rem", lineHeight: 1.6 }}>
            You're on the list. We'll contact you as soon as Tellinex is available in your parish.
            <br />
            <span style={{ color: "#00C7B1", fontWeight: 600 }}>Welcome to the future of Jamaican connectivity.</span>
          </p>
        </div>
      )}
    </div>
  );
}
