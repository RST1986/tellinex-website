import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { gsap } from "gsap";
import { Signal, Shield, Zap, Globe, ArrowRight, Wifi, Server, Users } from "lucide-react";

const LAUNCH_DATE = new Date("2026-04-06T00:00:00").getTime();
const UNITS = ["days", "hours", "minutes", "seconds"] as const;
const LABELS: Record<(typeof UNITS)[number], string> = { days: "DAYS", hours: "HRS", minutes: "MIN", seconds: "SEC" };

function calcTime() {
  const diff = LAUNCH_DATE - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

const STATS = [
  { value: "425K", label: "Homes to be passed", icon: Users },
  { value: "1Gbps+", label: "Symmetrical speeds", icon: Zap },
  { value: "99.99%", label: "Uptime target", icon: Server },
  { value: "14", label: "Parishes covered", icon: Globe },
];

const VALUE_PROPS = [
  {
    icon: Shield,
    title: "Hurricane Resilient",
    desc: "100% underground micro-trenched fibre. While aerial networks fail in every storm, Tellinex stays connected.",
    color: "#00C7B1",
  },
  {
    icon: Zap,
    title: "Gigabit Speeds",
    desc: "Symmetrical upload and download on XGS-PON. Stream, work, and build without limits.",
    color: "#A3E635",
  },
  {
    icon: Globe,
    title: "Island-Wide Coverage",
    desc: "Starting in New Kingston, expanding to all 14 parishes. Residential, business, and enterprise.",
    color: "#00C7B1",
  },
  {
    icon: Wifi,
    title: "5G Ready",
    desc: "Every trench carries converged FTTH + 5G backhaul. One build, two networks, zero waste.",
    color: "#A3E635",
  },
];

export default function Home() {
  const [timeLeft, setTimeLeft] = useState(calcTime);
  const heroRef = useRef<HTMLDivElement>(null);
  const digitRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(".hero-badge", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5 }, 0.3);
      tl.fromTo(".hero-logo", { opacity: 0, scale: 0.6, filter: "blur(8px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1 }, 0.5);
      tl.to(".hero-logo", { textShadow: "0 0 40px rgba(0,199,177,0.9), 0 0 80px rgba(0,199,177,0.4)", duration: 0.4, yoyo: true, repeat: 1 }, 1.3);
      tl.fromTo(".hero-bar", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.6, transformOrigin: "left center", ease: "expo.out" }, 0.9);
      tl.fromTo(".hero-heading", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7 }, 1.1);
      tl.fromTo(".hero-sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 1.4);
      tl.fromTo(".cd-box", { opacity: 0, y: 50, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12 }, 1.6);
      tl.fromTo(".hero-cta", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, 2.1);
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // Countdown ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = calcTime();
        UNITS.forEach((unit, i) => {
          if (prev[unit] !== next[unit]) {
            const el = digitRefs.current[i];
            if (el) gsap.fromTo(el, { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "back.out(2)" });
          }
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(entry.target, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={heroRef}>
      {/* ─── HERO ─── */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="text-center w-full max-w-2xl mx-auto py-12">
          {/* Badge */}
          <div className="hero-badge flex items-center justify-center gap-2 mb-6 opacity-0">
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
              TELLINEX NETWORK — SIGNAL ACQUIRED
            </span>
            <Signal className="w-4 h-4 text-[#A3E635]" />
          </div>

          {/* Logo */}
          <div className="mb-6">
            <div className="hero-logo opacity-0 flex justify-center" style={{ lineHeight: 1 }}>
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
              className="hero-bar mx-auto mt-2 opacity-0"
              style={{
                height: "3px",
                width: "6rem",
                background: "linear-gradient(90deg, #00C7B1, #A3E635)",
                borderRadius: "2px",
                boxShadow: "0 0 12px rgba(163,230,53,0.6)",
              }}
            />
          </div>

          {/* Heading */}
          <h2
            className="hero-heading font-bold text-white opacity-0"
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontSize: "clamp(1.8rem, 6vw, 3.5rem)",
              letterSpacing: "-0.01em",
              marginBottom: "1rem",
            }}
          >
            Hurricane-Proof Internet
          </h2>
          <p
            className="hero-sub text-gray-400 opacity-0"
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
              marginBottom: "3rem",
              fontFamily: '"Nunito", sans-serif',
              letterSpacing: "0.04em",
              maxWidth: "480px",
              margin: "0 auto 3rem",
            }}
          >
            Jamaica's first underground fibre network. Launching April 2026.
            <span className="blink-cursor">_</span>
          </p>

          {/* Countdown */}
          <div className="grid grid-cols-4 gap-3 sm:gap-5 mb-10">
            {UNITS.map((unit, i) => (
              <div
                key={unit}
                className="cd-box relative opacity-0"
                style={{
                  background: "rgba(0,199,177,0.04)",
                  border: "1px solid rgba(0,199,177,0.25)",
                  borderRadius: "6px",
                  padding: "clamp(14px, 3vw, 22px) clamp(18px, 4vw, 36px)",
                  backdropFilter: "blur(10px)",
                  transition: "border-color 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={(e) => gsap.to(e.currentTarget, { boxShadow: "0 0 24px rgba(0,199,177,0.35)", borderColor: "rgba(0,199,177,0.7)", duration: 0.3 })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { boxShadow: "0 0 0px rgba(0,199,177,0)", borderColor: "rgba(0,199,177,0.25)", duration: 0.3 })}
              >
                <span className="corner tl" />
                <span className="corner tr" />
                <span className="corner bl" />
                <span className="corner br" />
                <span
                  ref={(el) => { digitRefs.current[i] = el; }}
                  style={{ display: "block", fontFamily: "monospace", fontWeight: 700, fontSize: "clamp(1.8rem, 5vw, 3rem)", color: "#00C7B1", lineHeight: 1, textShadow: "0 0 16px rgba(0,199,177,0.4)", letterSpacing: "0.04em" }}
                >
                  {String(timeLeft[unit]).padStart(2, "0")}
                </span>
                <span style={{ display: "block", fontFamily: '"Nunito", sans-serif', fontSize: "clamp(0.55rem, 1.5vw, 0.72rem)", color: "#A3E635", letterSpacing: "0.2em", marginTop: "6px" }}>
                  {LABELS[unit]}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="hero-cta opacity-0">
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
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.05, boxShadow: "0 0 32px rgba(163,230,53,0.6)", duration: 0.2 })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, boxShadow: "0 0 20px rgba(163,230,53,0.4)", duration: 0.2 })}
            >
              Register Your Interest <ArrowRight size={18} />
            </Link>
            <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", marginTop: "12px" }}>
              Be first to connect when we launch in your area
            </p>
          </div>
        </div>
      </section>

      {/* ─── VALUE PROPS ─── */}
      <section className="px-4 sm:px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16 scroll-reveal" style={{ opacity: 0 }}>
          <h3 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "#fff", marginBottom: "12px" }}>
            Why Tellinex?
          </h3>
          <div style={{ height: "3px", width: "4rem", background: "linear-gradient(90deg, #00C7B1, #A3E635)", borderRadius: "2px", margin: "0 auto 16px", boxShadow: "0 0 10px rgba(0,199,177,0.5)" }} />
          <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "1rem", color: "rgba(255,255,255,0.5)", maxWidth: "560px", margin: "0 auto" }}>
            After Hurricane Melissa devastated Jamaica's aerial networks, we're building the network that can't be blown down.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {VALUE_PROPS.map((v, i) => (
            <div
              key={i}
              className="scroll-reveal relative"
              style={{
                opacity: 0,
                background: "rgba(0,199,177,0.03)",
                border: "1px solid rgba(0,199,177,0.15)",
                borderRadius: "8px",
                padding: "28px",
                backdropFilter: "blur(8px)",
                transition: "border-color 0.3s, box-shadow 0.3s",
              }}
              onMouseEnter={(e) => gsap.to(e.currentTarget, { boxShadow: `0 0 20px ${v.color}30`, borderColor: `${v.color}50`, duration: 0.3 })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { boxShadow: "none", borderColor: "rgba(0,199,177,0.15)", duration: 0.3 })}
            >
              <span className="corner tl" />
              <span className="corner tr" />
              <span className="corner bl" />
              <span className="corner br" />
              <v.icon size={28} style={{ color: v.color, marginBottom: "14px", filter: `drop-shadow(0 0 8px ${v.color}60)` }} />
              <h4 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.15rem", color: "#fff", marginBottom: "8px" }}>{v.title}</h4>
              <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.88rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="px-4 sm:px-6 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="scroll-reveal text-center"
              style={{
                opacity: 0,
                background: "rgba(0,199,177,0.04)",
                border: "1px solid rgba(0,199,177,0.2)",
                borderRadius: "8px",
                padding: "24px 16px",
                backdropFilter: "blur(6px)",
              }}
            >
              <s.icon size={22} style={{ color: "#00C7B1", margin: "0 auto 10px", filter: "drop-shadow(0 0 6px rgba(0,199,177,0.5))" }} />
              <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#A3E635", textShadow: "0 0 12px rgba(163,230,53,0.3)" }}>
                {s.value}
              </div>
              <div style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginTop: "4px" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="px-4 sm:px-6 py-20 text-center">
        <div className="scroll-reveal" style={{ opacity: 0 }}>
          <h3 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "clamp(1.3rem, 3vw, 2rem)", color: "#fff", marginBottom: "16px" }}>
            Ready for internet that survives any storm?
          </h3>
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
              boxShadow: "0 0 20px rgba(163,230,53,0.4)",
            }}
          >
            Register Interest <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
