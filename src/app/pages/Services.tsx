import { useEffect } from "react";
import { Link } from "react-router";
import { gsap } from "gsap";
import { Home, Building, Building2, Globe, ArrowRight, Check } from "lucide-react";
import LegalNoticeLinks from "../components/LegalNoticeLinks";
import { useRevealSafe } from "../lib/useRevealSafe";
import {
  NETWORK_DESIGN_PRINCIPLE,
  PRICING_CTA_ENTERPRISE,
  PRICING_CTA_REGISTER,
  PRICING_PUBLIC_WORDING,
  PUBLIC_SERVICE_CATALOGUE,
} from "../content/commercialFacts";

const residential = PUBLIC_SERVICE_CATALOGUE.find((entry) => entry.service === "Residential fibre");
const business = PUBLIC_SERVICE_CATALOGUE.find((entry) => entry.service === "Business fibre");
const enterprise = PUBLIC_SERVICE_CATALOGUE.find((entry) => entry.service === "Enterprise solutions");
const wholesale = PUBLIC_SERVICE_CATALOGUE.find((entry) => entry.service === "Wholesale and backhaul");

const TIERS = [
  {
    icon: Home,
    name: residential?.service ?? "Residential fibre",
    tagline: residential?.publicCopy ?? "Planned home connectivity",
    status: residential?.status ?? "PLANNED",
    color: "#00C7B1",
    features: [
      "Gigabit-class symmetrical intent",
      "Underground-first design principle",
      "Installation and equipment details to be confirmed",
      "Interest registration — not an order",
    ],
    price: PRICING_PUBLIC_WORDING,
    cta: PRICING_CTA_REGISTER,
    href: "/register",
  },
  {
    icon: Building,
    name: business?.service ?? "Business fibre",
    tagline: business?.publicCopy ?? "Planned business connectivity",
    status: business?.status ?? "PLANNED",
    color: "#A3E635",
    features: [
      "Dedicated business connectivity — planned",
      "SLA figures are not approved product commitments",
      "Fault-response targets to be confirmed",
      "Interest registration — not an order",
    ],
    price: PRICING_PUBLIC_WORDING,
    cta: PRICING_CTA_REGISTER,
    href: "/register",
  },
  {
    icon: Building2,
    name: enterprise?.service ?? "Enterprise solutions",
    tagline: enterprise?.publicCopy ?? "Bespoke connectivity — by enquiry",
    status: enterprise?.status ?? "PLANNED",
    color: "#00C7B1",
    features: [
      "Dedicated circuits and dark fibre — planned products",
      "Redundancy and integration designed per organisation",
      "No published contractual SLA on this website",
      "Contact the enterprise team",
    ],
    price: PRICING_PUBLIC_WORDING,
    cta: PRICING_CTA_ENTERPRISE,
    href: "/contact",
  },
  {
    icon: Globe,
    name: wholesale?.service ?? "Wholesale and backhaul",
    tagline: wholesale?.publicCopy ?? "Carrier-grade access — planned",
    status: wholesale?.status ?? "PLANNED",
    color: "#A3E635",
    features: [
      "Wholesale transport and tower fibre — planned",
      "IRU and dark-fibre products to be confirmed",
      "Open-access model is design intent",
      "Not a live wholesale offer",
    ],
    price: PRICING_PUBLIC_WORDING,
    cta: PRICING_CTA_ENTERPRISE,
    href: "/contact",
  },
];

export default function Services() {
  useRevealSafe(".reveal-safe");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".svc-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
      gsap.fromTo(".svc-card", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out", delay: 0.2 });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="px-4 sm:px-6 py-20 max-w-6xl mx-auto">
      <div className="text-center mb-16 svc-title reveal-safe">
        <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "#fff", marginBottom: "12px" }}>
          Planned services
        </h1>
        <div style={{ height: "3px", width: "5rem", background: "linear-gradient(90deg, #00C7B1, #A3E635)", borderRadius: "2px", margin: "0 auto 16px" }} />
        <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "1.05rem", color: "rgba(255,255,255,0.5)", maxWidth: "640px", margin: "0 auto" }}>
          {NETWORK_DESIGN_PRINCIPLE.value} Plans are not live services. Draft prices are not contractual offers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className="svc-card reveal-safe relative"
            style={{
              background: "rgba(0,199,177,0.03)",
              border: `1px solid ${tier.color}25`,
              borderRadius: "10px",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <tier.icon size={28} style={{ color: tier.color }} />
              <div>
                <h2 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.2rem", color: "#fff" }}>{tier.name}</h2>
                <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.78rem", color: tier.color }}>{tier.tagline}</p>
                <p style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "rgba(163,230,53,0.7)", marginTop: "4px", letterSpacing: "0.12em" }}>{tier.status}</p>
              </div>
            </div>

            <div style={{ flex: 1, marginBottom: "20px" }}>
              {tier.features.map((feature) => (
                <div key={feature} className="flex items-start gap-2" style={{ marginBottom: "8px" }}>
                  <Check size={14} style={{ color: tier.color, marginTop: "3px", flexShrink: 0 }} />
                  <span style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>{feature}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px solid ${tier.color}15`, paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.78rem", color: tier.color, letterSpacing: "0.06em" }}>{tier.price}</span>
              <Link
                to={tier.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 600,
                  fontSize: "0.68rem",
                  color: "#040d14",
                  background: tier.color,
                  padding: "8px 14px",
                  borderRadius: "5px",
                  textDecoration: "none",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {tier.cta.replace(/_/g, " ")} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center mt-16" style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
        No price on this page is an offer. SLA language is target or draft only. Register for launch updates or contact the enterprise team.
      </p>
      <LegalNoticeLinks />
    </div>
  );
}
