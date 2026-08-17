import { LEGAL_REVIEW_REQUIRED } from "../content/commercialFacts";
import LegalNoticeLinks from "../components/LegalNoticeLinks";

export default function Terms() {
  return (
    <div className="px-4 sm:px-6 py-20 max-w-3xl mx-auto">
      <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3rem)", color: "#fff", marginBottom: "12px" }}>
        Terms of use
      </h1>
      <p style={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.14em", color: "#A3E635", marginBottom: "16px" }}>
        DRAFT · LEGAL_REVIEW_REQUIRED={LEGAL_REVIEW_REQUIRED ? "YES" : "NO"}
      </p>
      <p style={{ fontFamily: '"Nunito", sans-serif', color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "16px" }}>
        This website describes a network that is being built. Interest registration is not a service contract, not an order, and not service activation. Published plans, speeds, coverage, and prices are not offers unless a later written contract says so.
      </p>
      <p style={{ fontFamily: '"Nunito", sans-serif', color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "16px" }}>
        The public website is not a control plane. Visitors cannot heal, redeploy, or operate Tellinex systems from this site. AI chat is an assistant, not an authority on coverage, pricing, dates, or operational status.
      </p>
      <p style={{ fontFamily: '"Nunito", sans-serif', color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
        This draft is not legal advice and is not an approved terms of service. Company number, registered address, and licence details are omitted until approved.
      </p>
      <LegalNoticeLinks />
    </div>
  );
}
