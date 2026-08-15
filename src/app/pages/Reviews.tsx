import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Star, Send, MessageCircle, CheckCircle } from "lucide-react";
import TurnstileWidget, { type TurnstileWidgetHandle } from "../components/TurnstileWidget";
import LegalNoticeLinks from "../components/LegalNoticeLinks";
import { submitPublicForm } from "../lib/publicForms";
import { sanitizePublicReview, type PublicReviewView } from "../lib/sanitizePublicReview";
import { REVIEWS_MODE } from "../content/commercialFacts";

const SB_URL = import.meta.env.VITE_SUPABASE_URL || "https://egztpclpcnizcdtfugsv.supabase.co";
const SB_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const PUBLIC_REVIEW_FIELDS = "id,reviewer_name,reviewer_type,rating,title,review_text,is_featured,is_partner_endorsement,response_text,created_at";

export default function Reviews() {
  const [reviews, setReviews] = useState<PublicReviewView[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", rating: 5, title: "", text: "", type: "residential" });
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  useEffect(() => {
    void loadReviews();
  }, []);

  async function loadReviews() {
    setIsLoadingReviews(true);
    setLoadError("");

    if (!SB_ANON) {
      setReviews([]);
      setLoadError("Public reviews are not configured in this environment.");
      setIsLoadingReviews(false);
      return;
    }

    try {
      const response = await fetch(
        `${SB_URL}/rest/v1/v_public_customer_reviews?select=${PUBLIC_REVIEW_FIELDS}&order=is_featured.desc,created_at.desc`,
        { headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}` } },
      );
      if (!response.ok) throw new Error(`Reviews request failed with status ${response.status}`);
      const data = (await response.json()) as Record<string, unknown>[];
      const sanitized = (Array.isArray(data) ? data : [])
        .map((row) => sanitizePublicReview(row))
        .filter((row): row is PublicReviewView => row !== null);
      setReviews(sanitized);
    } catch (error) {
      console.error("Unable to load public customer reviews", error);
      setReviews([]);
      setLoadError("Reviews are temporarily unavailable. Please try again later.");
    } finally {
      setIsLoadingReviews(false);
    }
  }

  const handleTurnstileToken = useCallback((token: string | null) => {
    setTurnstileToken(token);
    if (token) setSubmitError("");
  }, []);

  const handleTurnstileUnavailable = useCallback(() => {
    setSubmitError("The security check could not load. Please refresh the page and try again.");
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const reviewerName = form.name.trim();
    const reviewerEmail = form.email.trim();
    const reviewTitle = form.title.trim();
    const reviewText = form.text.trim();

    if (reviewerName.length < 2) {
      setSubmitError("Please enter a name with at least 2 characters.");
      return;
    }
    if (reviewText.length < 10) {
      setSubmitError("Please enter a review with at least 10 characters.");
      return;
    }
    if (reviewText.length > 4000) {
      setSubmitError("Please keep your review under 4,000 characters.");
      return;
    }
    if (reviewTitle.length > 160) {
      setSubmitError("Please keep the review title under 160 characters.");
      return;
    }
    if (!turnstileToken) {
      setSubmitError("Complete the security check before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await submitPublicForm("customer_review", turnstileToken, {
        reviewer_name: reviewerName,
        reviewer_email: reviewerEmail || null,
        rating: form.rating,
        title: reviewTitle || null,
        review_text: reviewText,
        reviewer_type: form.type,
      });
      setSubmitted(true);
      setShowForm(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We could not submit your review. Please try again.");
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  const stars = (count: number) =>
    Array.from({ length: 5 }, (_, index) => (
      <Star key={index} size={14} fill={index < count ? "#FFD700" : "none"} stroke={index < count ? "#FFD700" : "rgba(255,255,255,0.15)"} />
    ));
  const formatDate = (value: string) =>
    value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";
  const typeLabel: Record<string, string> = {
    residential: "Residential",
    business: "Business",
    hotel: "Hospitality",
    mdu: "Apartment",
    partner: "Partner",
    government: "Government",
  };

  return (
    <div className="px-4 sm:px-6 py-20 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "#fff", marginBottom: "12px" }}>
          Early feedback
        </h1>
        <div style={{ height: "3px", width: "5rem", background: "linear-gradient(90deg, #00C7B1, #A3E635)", borderRadius: "2px", margin: "0 auto 16px" }} />
        <p style={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.16em", color: "#A3E635" }} data-reviews-mode={REVIEWS_MODE}>
          Early feedback · pre-launch
        </p>
        <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.95rem", color: "rgba(255,255,255,0.5)", maxWidth: "560px", margin: "12px auto 0" }}>
          Tellinex is pre-launch. Published comments are moderated early feedback, not established mass-market sentiment. We do not fabricate reviews.
        </p>
      </div>

      {submitted && (
        <div style={{ background: "rgba(0,199,177,0.08)", border: "1px solid rgba(0,199,177,0.25)", borderRadius: "10px", padding: "24px", textAlign: "center", marginBottom: "24px" }}>
          <CheckCircle size={32} style={{ color: "#00C7B1", margin: "0 auto 8px" }} />
          <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, color: "#fff" }}>Request received</p>
          <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>Your review was submitted for approval. It is not published yet.</p>
        </div>
      )}

      {!showForm && !submitted && (
        <div className="text-center mb-10">
          <button
            onClick={() => {
              setSubmitError("");
              setShowForm(true);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 36px",
              background: "rgba(0,199,177,0.1)",
              border: "1px solid rgba(0,199,177,0.3)",
              borderRadius: "8px",
              color: "#00C7B1",
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            <Send size={16} /> Leave early feedback
          </button>
        </div>
      )}

      {showForm && (
        <div style={{ background: "rgba(0,199,177,0.03)", border: "1px solid rgba(0,199,177,0.15)", borderRadius: "10px", padding: "28px", marginBottom: "24px" }}>
          <h2 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.1rem", color: "#fff", marginBottom: "16px" }}>Share early feedback</h2>
          <form onSubmit={submit} style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name *" required minLength={2} maxLength={120} style={{ padding: "10px 14px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontFamily: '"Nunito", sans-serif', fontSize: "0.85rem" }} />
              <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email (optional)" type="email" maxLength={254} style={{ padding: "10px 14px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontFamily: '"Nunito", sans-serif', fontSize: "0.85rem" }} />
            </div>
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Title" maxLength={160} style={{ padding: "10px 14px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontFamily: '"Nunito", sans-serif', fontSize: "0.85rem" }} />
            <textarea value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} placeholder="Your feedback *" required minLength={10} maxLength={4000} rows={4} style={{ padding: "10px 14px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontFamily: '"Nunito", sans-serif', fontSize: "0.85rem", resize: "vertical" }} />
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div>
                <span style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginRight: "8px" }}>Rating:</span>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button key={value} type="button" onClick={() => setForm({ ...form, rating: value })} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
                    <Star size={20} fill={value <= form.rating ? "#FFD700" : "none"} stroke={value <= form.rating ? "#FFD700" : "rgba(255,255,255,0.2)"} />
                  </button>
                ))}
              </div>
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontFamily: '"Nunito", sans-serif', fontSize: "0.8rem" }}>
                <option value="residential">Residential</option>
                <option value="business">Business</option>
                <option value="hotel">Hotel</option>
                <option value="mdu">Apartment</option>
              </select>
            </div>
            <TurnstileWidget
              ref={turnstileRef}
              action="customer_review"
              onTokenChange={handleTurnstileToken}
              onUnavailable={handleTurnstileUnavailable}
            />
            {submitError && (
              <p role="alert" aria-live="polite" style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.82rem", color: "#ff8a8a", margin: 0 }}>
                {submitError}
              </p>
            )}
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" disabled={isSubmitting || !turnstileToken} style={{ padding: "12px 32px", borderRadius: "6px", border: "none", background: "#00C7B1", color: "#0a0a14", fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "0.85rem", cursor: isSubmitting || !turnstileToken ? "not-allowed" : "pointer", opacity: isSubmitting || !turnstileToken ? 0.65 : 1 }}>
                {isSubmitting ? "Submitting…" : "Submit feedback"}
              </button>
              <button type="button" disabled={isSubmitting} onClick={() => { setSubmitError(""); setShowForm(false); }} style={{ padding: "12px 24px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", fontFamily: '"Nunito", sans-serif', fontSize: "0.85rem", cursor: isSubmitting ? "not-allowed" : "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoadingReviews && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(255,255,255,0.3)" }}>
          <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500 }}>Loading approved feedback…</p>
        </div>
      )}

      {loadError && !isLoadingReviews && (
        <div role="alert" style={{ textAlign: "center", padding: "36px 0", color: "rgba(255,255,255,0.45)" }}>
          <MessageCircle size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500 }}>{loadError}</p>
        </div>
      )}

      {!isLoadingReviews && !loadError && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {reviews.map((review) => (
            <article key={review.id} style={{ background: "rgba(0,199,177,0.03)", border: `1px solid ${review.isFeatured ? "rgba(0,199,177,0.2)" : "rgba(255,255,255,0.04)"}`, borderRadius: "10px", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <div style={{ display: "flex", gap: "1px" }}>{stars(review.rating)}</div>
                    {review.isPartnerEndorsement && <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#A3E635", border: "1px solid rgba(163,230,53,0.3)", padding: "2px 8px", borderRadius: "3px" }}>PARTNER</span>}
                    {review.isFeatured && <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", padding: "2px 8px", borderRadius: "3px" }}>FEATURED</span>}
                  </div>
                  {review.title && <h3 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1rem", color: "#fff", marginBottom: "4px" }}>{review.title}</h3>}
                </div>
                <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>{formatDate(review.createdAt)}</span>
              </div>
              <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.88rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "8px" }}>{review.reviewText}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>{review.reviewerName}</span>
                {review.reviewerType && <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#00C7B1", border: "1px solid rgba(0,199,177,0.2)", padding: "1px 6px", borderRadius: "3px" }}>{typeLabel[review.reviewerType] || review.reviewerType}</span>}
              </div>
              {review.responseText && (
                <div style={{ marginTop: "12px", padding: "12px 16px", background: "rgba(0,199,177,0.05)", borderLeft: "2px solid #00C7B1", borderRadius: "0 6px 6px 0" }}>
                  <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "0.7rem", color: "#00C7B1" }}>Tellinex response</span>
                  <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{review.responseText}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {!isLoadingReviews && !loadError && reviews.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(255,255,255,0.3)" }}>
          <MessageCircle size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500 }}>No approved public feedback yet.</p>
        </div>
      )}
      <LegalNoticeLinks />
    </div>
  );
}
