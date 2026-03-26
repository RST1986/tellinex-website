import { useEffect } from "react";
import { Link } from "react-router";
import { gsap } from "gsap";
import { Home, Building, Building2, Globe, ArrowRight, Check } from "lucide-react";

const TIERS = [
  {
    icon: Home,
    name: "Residential Fibre",
    tagline: "Gigabit for every home",
    color: "#00C7B1",
    features: [
      "Up to 1 Gbps symmetrical",
      "Underground hurricane-proof connection",
      "Free professional installation",
      "Wi-Fi 6E router included",
      "No data caps, no throttling",
      "24/7 Jamaican-based support",
    ],
    price: "From US$45/month",
    cta: "Register for residential",
  },
  {
    icon: Building,
    name: "Business Fibre",
    tagline: "Dedicated business connectivity",
    color: "#A3E635",
    features: [
      "Up to 2 Gbps symmetrical",
      "99.9% uptime SLA",
      "Static IP addresses included",
      "Priority fault response (4hr)",
      "Business-grade Wi-Fi mesh",
      "Dedicated account manager",
    ],
    price: "From US$99/month",
    cta: "Register for business",
  },
  {
    icon: Building2,
    name: "Enterprise Solutions",
    tagline: "Bespoke connectivity for large organisations",
    color: "#00C7B1",
    features: [
      "10 Gbps+ dedicated circuits",
      "Point-to-point dark fibre",
      "99.99% uptime SLA with credits",
      "Dual-path redundancy available",
      "MPLS / SD-WAN integration",
      "Custom network design & engineering",
    ],
    price: "Custom pricing",
    cta: "Request enterprise proposal",
  },
  {
    icon: Globe,
    name: "Wholesale & Backhaul",
    tagline: "Carrier-grade infrastructure access",
    color: "#A3E635",
    features: [
      "5G small cell backhaul",
      "Tower fibre connectivity",
      "IRU & dark fibre leasing",
      "Colocation at carrier-neutral sites",
      "International transit via TAM-1",
      "Open-access network model",
    ],
    price: "Volume-based",
    cta: "Discuss wholesale partnership",
  },
];

export default function Services() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".svc-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
      gsap.fromTo(".svc-card", { opacity: 0, y: 50, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15, ease: "power3.out", delay: 0.3 });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="px-4 sm:px-6 py-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16 svc-title">
        <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "#fff", marginBottom: "12px" }}>
          Our Services
        </h1>
        <div style={{ height: "3px", width: "5rem", background: "linear-gradient(90deg, #00C7B1, #A3E635)", borderRadius: "2px", margin: "0 auto 16px", boxShadow: "0 0 12px rgba(0,199,177,0.5)" }} />
        <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "1.05rem", color: "rgba(255,255,255,0.5)", maxWidth: "600px", margin: "0 auto" }}>
          From homes to hyperscale. Every connection is underground, hurricane-resilient, and built for the next generation.
        </p>
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className="svc-card relative"
            style={{
              background: "rgba(0,199,177,0.03)",
              border: `1px solid ${tier.color}25`,
              borderRadius: "10px",
              padding: "32px",
              backdropFilter: "blur(8px)",
              transition: "border-color 0.3s, box-shadow 0.3s",
              display: "flex",
              flexDirection: "column",
            }}
            onMouseEnter={(e) => gsap.to(e.currentTarget, { boxShadow: `0 0 24px ${tier.color}25`, borderColor: `${tier.color}50`, duration: 0.3 })}
            onMouseLeave={(e) => gsap.to(e.currentTarget, { boxShadow: "none", borderColor: `${tier.color}25`, duration: 0.3 })}
          >
            <span className="corner tl" />
            <span className="corner tr" />
            <span className="corner bl" />
            <span className="corner br" />

            <div className="flex items-center gap-3 mb-4">
              <tier.icon size={28} style={{ color: tier.color, filter: `drop-shadow(0 0 8px ${tier.color}60)` }} />
              <div>
                <h3 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.2rem", color: "#fff" }}>{tier.name}</h3>
                <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.78rem", color: tier.color, letterSpacing: "0.04em" }}>{tier.tagline}</p>
              </div>
            </div>

            <div style={{ flex: 1, marginBottom: "20px" }}>
              {tier.features.map((f) => (
                <div key={f} className="flex items-start gap-2" style={{ marginBottom: "8px" }}>
                  <Check size={14} style={{ color: tier.color, marginTop: "3px", flexShrink: 0 }} />
                  <span style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px solid ${tier.color}15`, paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "1rem", color: tier.color, textShadow: `0 0 10px ${tier.color}40` }}>{tier.price}</span>
              <Link
                to="/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  color: "#040d14",
                  background: tier.color,
                  padding: "8px 16px",
                  borderRadius: "5px",
                  textDecoration: "none",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  boxShadow: `0 0 12px ${tier.color}40`,
                }}
              >
                Register <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom note */}
      <div className="text-center mt-16" style={{ opacity: 0.5 }}>
        <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
          Final pricing will be confirmed before launch. Register now to lock in founding member rates.
        </p>
      </div>
    </div>
  );
}
