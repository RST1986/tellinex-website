import { COMPANY, LEGAL_REVIEW_REQUIRED } from "../content/commercialFacts";
import LegalNoticeLinks from "../components/LegalNoticeLinks";
import { useDraftLegalRobots } from "../lib/useDraftLegalRobots";

export default function Privacy() {
  useDraftLegalRobots();
  return (
    <div className="px-4 sm:px-6 py-20 max-w-3xl mx-auto">
      <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3rem)", color: "#fff", marginBottom: "12px" }}>
        Privacy notice
      </h1>
      <p style={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.14em", color: "#A3E635", marginBottom: "16px" }}>
        DRAFT · LEGAL_REVIEW_REQUIRED={LEGAL_REVIEW_REQUIRED ? "YES" : "NO"}
      </p>
      <p style={{ fontFamily: '"Nunito", sans-serif', color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "16px" }}>
        Tellinex Limited collects interest-registration and enquiry details you submit (name, email, phone, parish, and optional comments) so we can contact you about future service. This is not a live customer account and not a contract.
      </p>
      <p style={{ fontFamily: '"Nunito", sans-serif', color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "16px" }}>
        Public forms go through a Turnstile-protected gateway. The browser does not insert rows directly into Tellinex databases. Chat messages may be processed by an AI assistant after you acknowledge that disclosure. Quote extraction from chat is not persisted as a customer record by the public website.
      </p>
      <p style={{ fontFamily: '"Nunito", sans-serif', color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "16px" }}>
        We do not publish a company number, registered office, or licence number on this page because those details are not approved for this draft. Contact {COMPANY.publicEmail} for privacy requests.
      </p>
      <p style={{ fontFamily: '"Nunito", sans-serif', color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
        This draft is not legal advice and is not an approved privacy policy.
      </p>
      <LegalNoticeLinks />
    </div>
  );
}
