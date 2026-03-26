import { useEffect } from "react";
import { gsap } from "gsap";
import { Shield, Award, MapPin, Users, Cpu, Cable } from "lucide-react";

const TEAM = [
  {
    initials: "OG",
    name: "Omar Gentles",
    role: "Chief Executive Officer & Co-Founder",
    color: "#00C7B1",
    bio: "Jamaican national and certified cybersecurity professional (MSc, CRISC, CISM, CISA, CEH, CHFI) with deep roots in Kingston's business community. Omar brings investor relations expertise, government liaison experience, and an intimate understanding of Jamaica's telecommunications and security landscape. He leads Tellinex's commercial strategy, regulatory engagement, cybersecurity architecture, and fundraising.",
    highlights: ["MSc Cybersecurity", "CRISC / CISM / CISA / CEH certified", "Investor & government relations", "Jamaican market expertise"],
  },
  {
    initials: "RS",
    name: "Rui Santos",
    role: "Technical Director & Co-Founder",
    color: "#A3E635",
    bio: "Portuguese telecommunications engineer with 21 years of experience designing and building fibre and copper networks across Europe. Rui project-managed the first FTTH (Fibre-to-the-Home) network ever built in Portugal at Cabovisão — a credential that proves he can take a greenfield ISP from zero to nationwide scale.",
    highlights: ["21 years telecom experience", "Built Portugal's first FTTH network", "Fibre + copper network specialist"],
  },
];

const MILESTONES = [
  { year: "2005", text: "Rui Santos builds Portugal's first FTTH network at Cabovisão" },
  { year: "2025", text: "Hurricane Melissa (Cat 5) devastates Jamaica's aerial infrastructure" },
  { year: "2026", text: "Tellinex established — Jamaica's first underground fibre ISP" },
  { year: "2026", text: "Pilot launch: New Kingston 8km micro-trenched network" },
  { year: "2027", text: "National expansion — Portmore, Spanish Town, Montego Bay" },
  { year: "2030", text: "Target: 180,000 homes passed across 14 parishes" },
];

const VALUES = [
  { icon: Shield, title: "Resilience First", desc: "Every decision — from cable depth to route design — prioritises permanence over speed. We build once, and we build to last.", color: "#00C7B1" },
  { icon: Cpu, title: "AI-Native Operations", desc: "Automated network design, predictive fault detection, and AI-driven customer support from day one. Not retrofitted — built in.", color: "#A3E635" },
  { icon: Cable, title: "Underground Always", desc: "100% micro-trenched fibre. No poles, no aerial cable, no storm vulnerability. The network Hurricane Melissa can't touch.", color: "#00C7B1" },
  { icon: Users, title: "Jamaica-First", desc: "Jamaican-led, Jamaican-operated. We hire locally, train locally, and reinvest in Jamaican communities and talent.", color: "#A3E635" },
];

export default function About() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".about-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
      gsap.fromTo(".about-card", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power3.out", delay: 0.3 });

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
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="px-4 sm:px-6 py-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16 about-title">
        <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "#fff", marginBottom: "12px" }}>
          About Tellinex
        </h1>
        <div style={{ height: "3px", width: "5rem", background: "linear-gradient(90deg, #00C7B1, #A3E635)", borderRadius: "2px", margin: "0 auto 16px", boxShadow: "0 0 12px rgba(0,199,177,0.5)" }} />
        <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "1.05rem", color: "rgba(255,255,255,0.5)", maxWidth: "620px", margin: "0 auto" }}>
          Two founders. One mission. Build the fibre network Jamaica deserves — underground, unstoppable, and ready for the next century.
        </p>
      </div>

      {/* Mission statement */}
      <div
        className="about-card relative mb-16"
        style={{
          background: "rgba(0,199,177,0.04)",
          border: "1px solid rgba(0,199,177,0.2)",
          borderRadius: "10px",
          padding: "36px",
          backdropFilter: "blur(8px)",
          textAlign: "center",
        }}
      >
        <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
        <Award size={32} style={{ color: "#A3E635", margin: "0 auto 14px", filter: "drop-shadow(0 0 10px rgba(163,230,53,0.5))" }} />
        <h3 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.3rem", color: "#fff", marginBottom: "12px" }}>Our Mission</h3>
        <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "1rem", color: "rgba(255,255,255,0.55)", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
          After Hurricane Melissa exposed the fragility of Jamaica's aerial telecommunications, Tellinex was founded to deliver what the island has never had: a hurricane-proof, underground fibre network that connects every home, business, and institution — permanently.
        </p>
      </div>

      {/* Team */}
      <div className="mb-20">
        <h3 className="scroll-reveal text-center" style={{ opacity: 0, fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.4rem", color: "#fff", marginBottom: "24px" }}>
          Leadership
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEAM.map((t) => (
            <div
              key={t.name}
              className="scroll-reveal relative"
              style={{
                opacity: 0,
                background: "rgba(0,199,177,0.03)",
                border: `1px solid ${t.color}20`,
                borderRadius: "10px",
                padding: "32px",
                backdropFilter: "blur(8px)",
                transition: "border-color 0.3s, box-shadow 0.3s",
              }}
              onMouseEnter={(e) => gsap.to(e.currentTarget, { boxShadow: `0 0 24px ${t.color}20`, borderColor: `${t.color}45`, duration: 0.3 })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { boxShadow: "none", borderColor: `${t.color}20`, duration: 0.3 })}
            >
              <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />

              {/* Avatar placeholder */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: `${t.color}18`,
                    border: `2px solid ${t.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color: t.color,
                    flexShrink: 0,
                    textShadow: `0 0 12px ${t.color}50`,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <h4 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.15rem", color: "#fff" }}>{t.name}</h4>
                  <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.78rem", color: t.color, letterSpacing: "0.03em" }}>{t.role}</p>
                </div>
              </div>

              <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.88rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: "16px" }}>
                {t.bio}
              </p>

              <div className="flex flex-wrap gap-2">
                {t.highlights.map((h) => (
                  <span
                    key={h}
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.65rem",
                      letterSpacing: "0.08em",
                      color: t.color,
                      border: `1px solid ${t.color}30`,
                      padding: "3px 10px",
                      borderRadius: "3px",
                      background: `${t.color}08`,
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-center mt-6" style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>
          Team photos coming soon — we're too busy building the network
        </p>
      </div>

      {/* Values */}
      <div className="mb-20">
        <h3 className="scroll-reveal text-center" style={{ opacity: 0, fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.4rem", color: "#fff", marginBottom: "24px" }}>
          What We Stand For
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {VALUES.map((v, i) => (
            <div
              key={i}
              className="scroll-reveal"
              style={{
                opacity: 0,
                background: "rgba(0,199,177,0.03)",
                border: `1px solid ${v.color}15`,
                borderRadius: "8px",
                padding: "24px",
                backdropFilter: "blur(6px)",
              }}
            >
              <v.icon size={24} style={{ color: v.color, marginBottom: "10px", filter: `drop-shadow(0 0 6px ${v.color}50)` }} />
              <h4 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1rem", color: "#fff", marginBottom: "6px" }}>{v.title}</h4>
              <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="scroll-reveal text-center" style={{ opacity: 0, fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.4rem", color: "#fff", marginBottom: "24px" }}>
          Our Journey
        </h3>
        <div className="max-w-2xl mx-auto">
          {MILESTONES.map((m, i) => (
            <div
              key={i}
              className="scroll-reveal flex gap-4 mb-6"
              style={{ opacity: 0 }}
            >
              <div className="flex flex-col items-center" style={{ flexShrink: 0, width: "50px" }}>
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: i % 2 === 0 ? "#00C7B1" : "#A3E635",
                    boxShadow: `0 0 8px ${i % 2 === 0 ? "rgba(0,199,177,0.6)" : "rgba(163,230,53,0.6)"}`,
                  }}
                />
                {i < MILESTONES.length - 1 && (
                  <div style={{ width: "1px", flex: 1, background: "rgba(0,199,177,0.15)", marginTop: "4px" }} />
                )}
              </div>
              <div style={{ paddingBottom: "12px" }}>
                <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.85rem", color: i % 2 === 0 ? "#00C7B1" : "#A3E635" }}>{m.year}</span>
                <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.88rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.5, marginTop: "2px" }}>{m.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
