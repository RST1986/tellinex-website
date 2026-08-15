import { Mail, MapPin, Globe } from "lucide-react";
import LegalNoticeLinks from "../components/LegalNoticeLinks";
import { COMPANY } from "../content/commercialFacts";

const CONTACTS = [
  { icon: Mail, label: "General enquiries", value: COMPANY.publicEmail, href: `mailto:${COMPANY.publicEmail}`, color: "#00C7B1" },
  { icon: Mail, label: "Enterprise and wholesale", value: COMPANY.enterpriseEmail, href: `mailto:${COMPANY.enterpriseEmail}`, color: "#A3E635" },
  { icon: MapPin, label: "Location", value: COMPANY.hqCity, href: null, color: "#00C7B1" },
  { icon: Globe, label: "Website", value: "tellinex.com", href: COMPANY.website, color: "#A3E635" },
];

export default function Contact() {
  return (
    <div className="px-4 sm:px-6 py-20 max-w-3xl mx-auto">
      <div className="text-center mb-16">
        <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "#fff", marginBottom: "12px" }}>
          Contact
        </h1>
        <div style={{ height: "3px", width: "5rem", background: "linear-gradient(90deg, #00C7B1, #A3E635)", borderRadius: "2px", margin: "0 auto 16px" }} />
        <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "1.05rem", color: "rgba(255,255,255,0.5)", maxWidth: "560px", margin: "0 auto" }}>
          Email Tellinex directly. The on-site message form is not yet available — we will not show a fake success state.
        </p>
      </div>

      <div
        role="status"
        style={{
          background: "rgba(163,230,53,0.06)",
          border: "1px solid rgba(163,230,53,0.25)",
          borderRadius: "10px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <p style={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.16em", color: "#A3E635", marginBottom: "8px" }}>
          CONTACT_FORM=NOT_YET_AVAILABLE
        </p>
        <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.92rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
          No public contact-form contract is approved on this branch. Use email. Do not invent a remote schema. A separate public-form gateway change may compose later.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {CONTACTS.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3"
            style={{
              background: "rgba(0,199,177,0.03)",
              border: `1px solid ${item.color}18`,
              borderRadius: "8px",
              padding: "16px 20px",
            }}
          >
            <item.icon size={20} style={{ color: item.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{item.label}</div>
              {item.href ? (
                <a href={item.href} style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.92rem", color: "#fff", fontWeight: 600, textDecoration: "none" }}>
                  {item.value}
                </a>
              ) : (
                <div style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.92rem", color: "#fff", fontWeight: 600 }}>{item.value}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      <LegalNoticeLinks />
    </div>
  );
}
