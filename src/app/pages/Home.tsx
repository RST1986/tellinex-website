import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { gsap } from "gsap";
import { Signal, Shield, Zap, Globe, ArrowRight, Wifi, Server } from "lucide-react";
import NetworkBuildStatus from "../components/NetworkBuildStatus";
import LegalNoticeLinks from "../components/LegalNoticeLinks";
import { useRevealSafe } from "../lib/useRevealSafe";
import {
  CURRENT_COVERAGE,
  LAUNCH_STATE,
  NATIONAL_EXPANSION,
  NETWORK_DESIGN_PRINCIPLE,
  POSITIONING,
  RESILIENCE_PUBLIC_WORDING,
  SYMMETRICAL_SPEED_INTENT,
  UPTIME_TARGET,
} from "../content/commercialFacts";

const STATS = [
  { value: "Design intent", label: SYMMETRICAL_SPEED_INTENT.value, icon: Zap, classification: "PLANNED" },
  { value: UPTIME_TARGET.value, label: "Uptime target — not a commitment", icon: Server, classification: "TARGET" },
  { value: "Planned", label: NATIONAL_EXPANSION.value, icon: Globe, classification: "PLANNED" },
];

const VALUE_PROPS = [
  {
    icon: Shield,
    title: "Resilience by design",
    desc: RESILIENCE_PUBLIC_WORDING.value,
    color: "#00C7B1",
  },
  {
    icon: Zap,
    title: "Gigabit-class intent",
    desc: SYMMETRICAL_SPEED_INTENT.value,
    color: "#A3E635",
  },
  {
    icon: Globe,
    title: "National programme — planned",
    desc: `${CURRENT_COVERAGE.value} ${NATIONAL_EXPANSION.value}`,
    color: "#00C7B1",
  },
  {
    icon: Wifi,
    title: "Digital infrastructure platform",
    desc: "Future fibre, enterprise connectivity, and wholesale transport on one underground-first design principle. Plans are not live services.",
    color: "#A3E635",
  },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  useRevealSafe(".reveal-safe");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(".hero-badge", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5 }, 0.2);
      tl.fromTo(".hero-logo", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.8 }, 0.35);
      tl.fromTo(".hero-bar", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.5, transformOrigin: "left center" }, 0.7);
      tl.fromTo(".hero-heading", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6 }, 0.85);
      tl.fromTo(".hero-sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 1.05);
      tl.fromTo(".hero-cta", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, 1.2);
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef}>
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="text-center w-full max-w-3xl mx-auto py-12">
          <div className="hero-badge reveal-safe flex items-center justify-center gap-2 mb-6">
            <Signal className="w-4 h-4 text-[#A3E635]" />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.25em",
                color: "#A3E635",
                textTransform: "uppercase",
                border: "1px solid rgba(163,230,53,0.4)",
                padding: "3px 12px",
                borderRadius: "2px",
                background: "rgba(163,230,53,0.06)",
              }}
            >
              {LAUNCH_STATE} — JAMAICA DIGITAL INFRASTRUCTURE
            </span>
            <Signal className="w-4 h-4 text-[#A3E635]" />
          </div>

          <div className="mb-6">
            <div className="hero-logo reveal-safe flex justify-center" style={{ lineHeight: 1 }}>
              <img
                src="/Logo.svg"
                alt="Tellinex"
                style={{
                  height: "clamp(4rem, 10vw, 8rem)",
                  width: "auto",
                  filter: "drop-shadow(0 0 30px rgba(0,199,177,0.7)) drop-shadow(0 0 60px rgba(0,199,177,0.3))",
                }}
              />
            </div>
            <div
              className="hero-bar mx-auto mt-2 reveal-safe"
              style={{
                height: "3px",
                width: "6rem",
                background: "linear-gradient(90deg, #00C7B1, #A3E635)",
                borderRadius: "2px",
              }}
            />
          </div>

          <h1
            className="hero-heading reveal-safe font-bold text-white"
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontSize: "clamp(1.8rem, 6vw, 3.2rem)",
              letterSpacing: "-0.01em",
              marginBottom: "1rem",
            }}
          >
            Building resilient digital infrastructure in Jamaica
          </h1>
          <p
            className="hero-sub reveal-safe text-gray-400"
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
              fontFamily: '"Nunito", sans-serif',
              letterSpacing: "0.03em",
              maxWidth: "640px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.6,
            }}
          >
            {POSITIONING.value}
          </p>

          <div className="hero-cta reveal-safe">
            <Link
              to="/register"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 32px",
                background: "#A3E635",
                color: "#040d14",
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 700,
                fontSize: "0.9rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                borderRadius: "6px",
                textDecoration: "none",
                boxShadow: "0 0 20px rgba(163,230,53,0.4)",
              }}
            >
              Register your interest <ArrowRight size={18} />
            </Link>
            <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginTop: "12px" }}>
              Interest registration only. Not a service contract. Launch date is not yet approved.
            </p>
          </div>
        </div>
      </section>

      <NetworkBuildStatus />

      <section className="px-4 sm:px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16 reveal-safe">
          <h2 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "#fff", marginBottom: "12px" }}>
            Why Tellinex
          </h2>
          <div style={{ height: "3px", width: "4rem", background: "linear-gradient(90deg, #00C7B1, #A3E635)", borderRadius: "2px", margin: "0 auto 16px" }} />
          <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "1rem", color: "rgba(255,255,255,0.5)", maxWidth: "640px", margin: "0 auto" }}>
            {NETWORK_DESIGN_PRINCIPLE.value}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {VALUE_PROPS.map((item) => (
            <div
              key={item.title}
              className="reveal-safe relative"
              style={{
                background: "rgba(0,199,177,0.03)",
                border: "1px solid rgba(0,199,177,0.15)",
                borderRadius: "8px",
                padding: "28px",
              }}
            >
              <item.icon size={28} style={{ color: item.color, marginBottom: "14px" }} />
              <h3 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.15rem", color: "#fff", marginBottom: "8px" }}>{item.title}</h3>
              <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.88rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="reveal-safe text-center"
              style={{
                background: "rgba(0,199,177,0.04)",
                border: "1px solid rgba(0,199,177,0.2)",
                borderRadius: "8px",
                padding: "24px 16px",
              }}
            >
              <stat.icon size={22} style={{ color: "#00C7B1", margin: "0 auto 10px" }} />
              <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "clamp(1.1rem, 2.4vw, 1.4rem)", color: "#A3E635" }}>
                {stat.value}
              </div>
              <div style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginTop: "8px", lineHeight: 1.45 }}>
                {stat.label}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "rgba(163,230,53,0.7)", marginTop: "8px", letterSpacing: "0.12em" }}>
                {stat.classification}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 py-20 text-center">
        <div className="reveal-safe">
          <h2 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "clamp(1.3rem, 3vw, 2rem)", color: "#fff", marginBottom: "16px" }}>
            Register for launch updates
          </h2>
          <Link
            to="/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 32px",
              background: "#A3E635",
              color: "#040d14",
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              borderRadius: "6px",
              textDecoration: "none",
            }}
          >
            Register interest <ArrowRight size={18} />
          </Link>
          <LegalNoticeLinks />
        </div>
      </section>
    </div>
  );
}
