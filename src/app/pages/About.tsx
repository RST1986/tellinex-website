import { useEffect } from "react";
import { gsap } from "gsap";
import { Shield, Award, Users, Cpu, Cable } from "lucide-react";
import LegalNoticeLinks from "../components/LegalNoticeLinks";
import { useRevealSafe } from "../lib/useRevealSafe";
import { BIOGRAPHIES, NATIONAL_EXPANSION, NETWORK_DESIGN_PRINCIPLE, POSITIONING } from "../content/commercialFacts";

const TEAM = [
  {
    initials: "OG",
    name: "Omar Gentles",
    role: "Chief Executive Officer and Co-Founder",
    color: "#00C7B1",
    classification: BIOGRAPHIES.omarGentles.class,
    bio: "Jamaican co-founder leading commercial strategy, regulatory engagement, and cybersecurity architecture. Professional certifications listed by the founders are not independently evidenced in this repository.",
    highlights: ["Founder-provided biography", "Independent evidence pending"],
  },
  {
    initials: "RS",
    name: "Rui Santos",
    role: "Technical Director and Co-Founder",
    color: "#A3E635",
    classification: BIOGRAPHIES.ruiSantos.class,
    bio: "Portuguese telecommunications engineer and co-founder responsible for network design and build. Historical European FTTH experience is founder-provided and not independently evidenced here.",
    highlights: ["Founder-provided biography", "Independent evidence pending"],
  },
];

const MILESTONES = [
  { year: "Design", text: "Underground-first fibre is a network design principle, not a completed national asset.", class: "PLANNED" },
  { year: "Now", text: "Tellinex is building the network. Public interest registration is open. This is not a live national service.", class: "CURRENT_VERIFIED" },
  { year: "Next", text: "Pilot corridor intent: New Kingston. Dates are not a public launch commitment.", class: "PLANNED" },
  { year: "Later", text: NATIONAL_EXPANSION.value, class: "PLANNED" },
];

const VALUES = [
  { icon: Shield, title: "Resilience first", desc: NETWORK_DESIGN_PRINCIPLE.value, color: "#00C7B1" },
  { icon: Cpu, title: "Operations discipline", desc: "Public website is not the control plane. Operational authority stays in private Tellinex systems.", color: "#A3E635" },
  { icon: Cable, title: "Underground-first design", desc: "Design intent is buried plant. That is not a storm-absolute guarantee and not a claim that the national network is already built.", color: "#00C7B1" },
  { icon: Users, title: "Jamaica-first", desc: "Tellinex is a Jamaican company building infrastructure for Jamaican homes, businesses, and institutions.", color: "#A3E635" },
];

export default function About() {
  useRevealSafe(".reveal-safe");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".about-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
      gsap.fromTo(".about-card", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power3.out", delay: 0.2 });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="px-4 sm:px-6 py-20 max-w-6xl mx-auto">
      <div className="text-center mb-16 about-title reveal-safe">
        <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "#fff", marginBottom: "12px" }}>
          About Tellinex
        </h1>
        <div style={{ height: "3px", width: "5rem", background: "linear-gradient(90deg, #00C7B1, #A3E635)", borderRadius: "2px", margin: "0 auto 16px" }} />
        <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "1.05rem", color: "rgba(255,255,255,0.5)", maxWidth: "640px", margin: "0 auto" }}>
          {POSITIONING.value}
        </p>
      </div>

      <div
        className="about-card reveal-safe relative mb-16"
        style={{
          background: "rgba(0,199,177,0.04)",
          border: "1px solid rgba(0,199,177,0.2)",
          borderRadius: "10px",
          padding: "36px",
          textAlign: "center",
        }}
      >
        <Award size={32} style={{ color: "#A3E635", margin: "0 auto 14px" }} />
        <h2 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.3rem", color: "#fff", marginBottom: "12px" }}>Mission</h2>
        <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "1rem", color: "rgba(255,255,255,0.55)", maxWidth: "640px", margin: "0 auto", lineHeight: 1.7 }}>
          Build resilient digital infrastructure in Jamaica. We do not publish fundraising totals, licence numbers, or primacy claims on this site until they are independently evidenced.
        </p>
      </div>

      <div className="mb-20">
        <h2 className="reveal-safe text-center" style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.4rem", color: "#fff", marginBottom: "24px" }}>
          Leadership
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="reveal-safe relative"
              style={{
                background: "rgba(0,199,177,0.03)",
                border: `1px solid ${member.color}20`,
                borderRadius: "10px",
                padding: "32px",
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: `${member.color}18`,
                    border: `2px solid ${member.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color: member.color,
                    flexShrink: 0,
                  }}
                >
                  {member.initials}
                </div>
                <div>
                  <h3 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.15rem", color: "#fff" }}>{member.name}</h3>
                  <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.78rem", color: member.color }}>{member.role}</p>
                </div>
              </div>
              <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.88rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: "16px" }}>
                {member.bio}
              </p>
              <div className="flex flex-wrap gap-2">
                {member.highlights.map((item) => (
                  <span
                    key={item}
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.65rem",
                      letterSpacing: "0.08em",
                      color: member.color,
                      border: `1px solid ${member.color}30`,
                      padding: "3px 10px",
                      borderRadius: "3px",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", marginTop: "12px" }}>
                {member.classification}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-20">
        <h2 className="reveal-safe text-center" style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.4rem", color: "#fff", marginBottom: "24px" }}>
          What we stand for
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="reveal-safe"
              style={{
                background: "rgba(0,199,177,0.03)",
                border: `1px solid ${value.color}15`,
                borderRadius: "8px",
                padding: "24px",
              }}
            >
              <value.icon size={24} style={{ color: value.color, marginBottom: "10px" }} />
              <h3 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1rem", color: "#fff", marginBottom: "6px" }}>{value.title}</h3>
              <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{value.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="reveal-safe text-center" style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.4rem", color: "#fff", marginBottom: "24px" }}>
          Governed milestones
        </h2>
        <div className="max-w-2xl mx-auto">
          {MILESTONES.map((milestone) => (
            <div key={milestone.year} className="reveal-safe flex gap-4 mb-6">
              <div className="flex flex-col items-center" style={{ flexShrink: 0, width: "72px" }}>
                <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.75rem", color: "#00C7B1" }}>{milestone.year}</span>
              </div>
              <div style={{ paddingBottom: "12px" }}>
                <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.88rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{milestone.text}</p>
                <p style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "rgba(163,230,53,0.7)", marginTop: "4px" }}>{milestone.class}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <LegalNoticeLinks />
    </div>
  );
}
