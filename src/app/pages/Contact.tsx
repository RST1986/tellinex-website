import { useEffect } from "react";
import { gsap } from "gsap";
import { Mail, MapPin, Globe, Clock, Send } from "lucide-react";

const CONTACTS = [
  { icon: Mail, label: "General enquiries", value: "info@tellinex.com", color: "#00C7B1" },
  { icon: Mail, label: "Enterprise & wholesale", value: "sales@tellinex.com", color: "#A3E635" },
  { icon: MapPin, label: "Location", value: "Kingston, Jamaica", color: "#00C7B1" },
  { icon: Globe, label: "Website", value: "tellinex.com", color: "#A3E635" },
  { icon: Clock, label: "Response time", value: "Within 24 hours", color: "#00C7B1" },
];

export default function Contact() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".ct-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
      gsap.fromTo(".ct-card", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.3 });
      gsap.fromTo(".ct-form", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.5 });
    });
    return () => ctx.revert();
  }, []);

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

  return (
    <div className="px-4 sm:px-6 py-20 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16 ct-title">
        <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "#fff", marginBottom: "12px" }}>
          Get in Touch
        </h1>
        <div style={{ height: "3px", width: "5rem", background: "linear-gradient(90deg, #00C7B1, #A3E635)", borderRadius: "2px", margin: "0 auto 16px", boxShadow: "0 0 12px rgba(0,199,177,0.5)" }} />
        <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "1.05rem", color: "rgba(255,255,255,0.5)", maxWidth: "520px", margin: "0 auto" }}>
          Whether you're a homeowner, business, enterprise, or potential partner — we'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Contact info cards */}
        <div>
          <h3 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.1rem", color: "#fff", marginBottom: "16px" }}>
            Contact Information
          </h3>
          <div className="flex flex-col gap-3">
            {CONTACTS.map((c, i) => (
              <div
                key={i}
                className="ct-card flex items-center gap-3 relative"
                style={{
                  background: "rgba(0,199,177,0.03)",
                  border: `1px solid ${c.color}18`,
                  borderRadius: "8px",
                  padding: "16px 20px",
                  backdropFilter: "blur(6px)",
                  transition: "border-color 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={(e) => gsap.to(e.currentTarget, { boxShadow: `0 0 16px ${c.color}20`, borderColor: `${c.color}40`, duration: 0.3 })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { boxShadow: "none", borderColor: `${c.color}18`, duration: 0.3 })}
              >
                <c.icon size={20} style={{ color: c.color, flexShrink: 0, filter: `drop-shadow(0 0 6px ${c.color}50)` }} />
                <div>
                  <div style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{c.label}</div>
                  <div style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.92rem", color: "#fff", fontWeight: 600 }}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Investor enquiries note */}
          <div
            className="ct-card mt-4 relative"
            style={{
              background: "rgba(163,230,53,0.04)",
              border: "1px solid rgba(163,230,53,0.2)",
              borderRadius: "8px",
              padding: "20px",
            }}
          >
            <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
            <h4 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "0.9rem", color: "#A3E635", marginBottom: "6px" }}>Investor Enquiries</h4>
            <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
              Tellinex is raising a Series A to fund Jamaica's first underground fibre network. For the investor deck and financial model, contact <span style={{ color: "#A3E635", fontWeight: 600 }}>invest@tellinex.com</span>
            </p>
          </div>
        </div>

        {/* Right: Contact form */}
        <div
          className="ct-form relative"
          style={{
            background: "rgba(0,199,177,0.03)",
            border: "1px solid rgba(0,199,177,0.18)",
            borderRadius: "10px",
            padding: "32px",
            backdropFilter: "blur(8px)",
          }}
        >
          <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />

          <h3 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.1rem", color: "#fff", marginBottom: "20px" }}>
            Send us a message
          </h3>

          <form onSubmit={(e) => { e.preventDefault(); alert("Message sent! We'll respond within 24 hours."); }}>
            <div className="mb-4">
              <label style={labelStyle}>Name *</label>
              <input type="text" required placeholder="Your name" style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(0,199,177,0.7)"; e.currentTarget.style.boxShadow = "0 0 12px rgba(0,199,177,0.15)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,199,177,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
            <div className="mb-4">
              <label style={labelStyle}>Email *</label>
              <input type="email" required placeholder="your@email.com" style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(0,199,177,0.7)"; e.currentTarget.style.boxShadow = "0 0 12px rgba(0,199,177,0.15)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,199,177,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
            <div className="mb-4">
              <label style={labelStyle}>Subject</label>
              <select
                style={{
                  ...inputStyle,
                  appearance: "none" as const,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300C7B1' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  paddingRight: "32px",
                }}
                defaultValue=""
              >
                <option value="" disabled>What's this about?</option>
                <option value="residential">Residential service</option>
                <option value="business">Business service</option>
                <option value="enterprise">Enterprise / wholesale</option>
                <option value="partnership">Partnership opportunity</option>
                <option value="careers">Careers</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="mb-6">
              <label style={labelStyle}>Message *</label>
              <textarea
                required
                rows={5}
                placeholder="Tell us how we can help..."
                style={{ ...inputStyle, resize: "vertical" as const }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(0,199,177,0.7)"; e.currentTarget.style.boxShadow = "0 0 12px rgba(0,199,177,0.15)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,199,177,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                background: "#A3E635",
                color: "#040d14",
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 700,
                fontSize: "0.85rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 0 16px rgba(163,230,53,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.02, boxShadow: "0 0 28px rgba(163,230,53,0.5)", duration: 0.2 })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, boxShadow: "0 0 16px rgba(163,230,53,0.35)", duration: 0.2 })}
            >
              <Send size={16} /> SEND MESSAGE
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
