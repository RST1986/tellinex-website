import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Signal, CheckCircle, MapPin, User, Mail, Phone, MessageSquare } from "lucide-react";

const PARISHES = [
  "Kingston", "St. Andrew", "St. Thomas", "Portland", "St. Mary",
  "St. Ann", "Trelawny", "St. James", "Hanover", "Westmoreland",
  "St. Elizabeth", "Manchester", "Clarendon", "St. Catherine",
];

const PROVIDERS = ["Flow", "Digicel", "Other", "None"];
const SPEND_RANGES = ["Under J$3,000", "J$3,000–5,000", "J$5,000–8,000", "J$8,000–12,000", "Over J$12,000"];
const PRIORITIES = ["Faster speeds", "Lower price", "Better reliability", "Hurricane resilience", "Better customer service", "Symmetrical upload/download"];

export default function Register() {
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".reg-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
      gsap.fromTo(".reg-form", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.3 });
    });
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formRef.current) {
      gsap.to(formRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        onComplete: () => setSubmitted(true),
      });
    }
  };

  const inputStyle: React.CSSProperties = {
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

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: '"Nunito", sans-serif',
    fontSize: "0.78rem",
    color: "rgba(255,255,255,0.5)",
    marginBottom: "6px",
    letterSpacing: "0.03em",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300C7B1' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: "32px",
  };

  return (
    <div className="px-4 sm:px-6 py-20 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 reg-title">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Signal className="w-4 h-4 text-[#A3E635]" />
          <span style={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.25em", color: "#A3E635", textTransform: "uppercase", border: "1px solid rgba(163,230,53,0.4)", padding: "3px 12px", borderRadius: "2px", background: "rgba(163,230,53,0.06)" }}>
            EARLY ACCESS — FOUNDING MEMBERS
          </span>
          <Signal className="w-4 h-4 text-[#A3E635]" />
        </div>
        <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "clamp(1.8rem, 5vw, 2.8rem)", color: "#fff", marginBottom: "12px" }}>
          Register Your Interest
        </h1>
        <div style={{ height: "3px", width: "5rem", background: "linear-gradient(90deg, #00C7B1, #A3E635)", borderRadius: "2px", margin: "0 auto 16px", boxShadow: "0 0 12px rgba(0,199,177,0.5)" }} />
        <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "1rem", color: "rgba(255,255,255,0.5)", maxWidth: "480px", margin: "0 auto" }}>
          Be among the first to connect when Tellinex launches in your parish. No obligation — just tell us where you are and what you need.
        </p>
      </div>

      {/* Social proof */}
      <div className="text-center mb-8" style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#00C7B1" }}>
        <span style={{ textShadow: "0 0 10px rgba(0,199,177,0.4)" }}>347+</span>
        <span style={{ color: "rgba(255,255,255,0.35)", marginLeft: "6px" }}>Jamaicans already registered</span>
      </div>

      {!submitted ? (
        <div ref={formRef} className="reg-form">
          <form
            onSubmit={handleSubmit}
            className="relative"
            style={{
              background: "rgba(0,199,177,0.03)",
              border: "1px solid rgba(0,199,177,0.18)",
              borderRadius: "10px",
              padding: "32px",
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />

            {/* Name & Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label style={labelStyle}><User size={12} style={{ display: "inline", marginRight: "4px" }} />Full name *</label>
                <input type="text" required placeholder="Your name" style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(0,199,177,0.7)"; e.currentTarget.style.boxShadow = "0 0 12px rgba(0,199,177,0.15)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,199,177,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label style={labelStyle}><Mail size={12} style={{ display: "inline", marginRight: "4px" }} />Email *</label>
                <input type="email" required placeholder="your@email.com" style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(0,199,177,0.7)"; e.currentTarget.style.boxShadow = "0 0 12px rgba(0,199,177,0.15)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,199,177,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Phone & Parish */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label style={labelStyle}><Phone size={12} style={{ display: "inline", marginRight: "4px" }} />Phone</label>
                <input type="tel" placeholder="+1-876-..." style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(0,199,177,0.7)"; e.currentTarget.style.boxShadow = "0 0 12px rgba(0,199,177,0.15)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,199,177,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label style={labelStyle}><MapPin size={12} style={{ display: "inline", marginRight: "4px" }} />Parish *</label>
                <select required style={selectStyle} defaultValue="">
                  <option value="" disabled>Select your parish</option>
                  {PARISHES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Community & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label style={labelStyle}>Community / Neighbourhood</label>
                <input type="text" placeholder="e.g. New Kingston, Half Way Tree" style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(0,199,177,0.7)"; e.currentTarget.style.boxShadow = "0 0 12px rgba(0,199,177,0.15)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,199,177,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Type *</label>
                <select required style={selectStyle} defaultValue="">
                  <option value="" disabled>Residential or Business?</option>
                  <option value="residential">Residential</option>
                  <option value="business">Business</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            {/* Current provider & spend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label style={labelStyle}>Current provider</label>
                <select style={selectStyle} defaultValue="">
                  <option value="" disabled>Who do you use now?</option>
                  {PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Monthly spend</label>
                <select style={selectStyle} defaultValue="">
                  <option value="" disabled>What do you pay now?</option>
                  {SPEND_RANGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Priorities checkboxes */}
            <div className="mb-5">
              <label style={labelStyle}>What matters most to you? (pick all that apply)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {PRIORITIES.map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-2 cursor-pointer"
                    style={{
                      fontFamily: '"Nunito", sans-serif',
                      fontSize: "0.78rem",
                      color: "rgba(255,255,255,0.55)",
                      padding: "6px 10px",
                      border: "1px solid rgba(0,199,177,0.12)",
                      borderRadius: "5px",
                      background: "rgba(0,199,177,0.02)",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <input
                      type="checkbox"
                      value={p}
                      style={{ accentColor: "#00C7B1", width: "14px", height: "14px" }}
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="mb-6">
              <label style={labelStyle}><MessageSquare size={12} style={{ display: "inline", marginRight: "4px" }} />Anything else?</label>
              <textarea
                rows={3}
                placeholder="Tell us what you need from your internet..."
                style={{ ...inputStyle, resize: "vertical" as const }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(0,199,177,0.7)"; e.currentTarget.style.boxShadow = "0 0 12px rgba(0,199,177,0.15)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,199,177,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                background: "#A3E635",
                color: "#040d14",
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 700,
                fontSize: "0.9rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(163,230,53,0.35)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.02, boxShadow: "0 0 30px rgba(163,230,53,0.5)", duration: 0.2 })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, boxShadow: "0 0 20px rgba(163,230,53,0.35)", duration: 0.2 })}
            >
              REGISTER MY INTEREST
            </button>

            <p className="text-center mt-3" style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.7rem", color: "rgba(255,255,255,0.25)" }}>
              No payment required. We'll notify you when Tellinex is available in your area.
            </p>
          </form>
        </div>
      ) : (
        <div
          className="text-center"
          style={{
            background: "rgba(0,199,177,0.08)",
            border: "1px solid rgba(0,199,177,0.5)",
            borderRadius: "10px",
            padding: "48px 32px",
            boxShadow: "0 0 40px rgba(0,199,177,0.15)",
          }}
        >
          <CheckCircle size={48} style={{ color: "#A3E635", margin: "0 auto 16px", filter: "drop-shadow(0 0 14px rgba(163,230,53,0.6))" }} />
          <h3 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, color: "#fff", fontSize: "1.4rem", marginBottom: "8px", letterSpacing: "0.05em" }}>
            CONNECTION ESTABLISHED
          </h3>
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
