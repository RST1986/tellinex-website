import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { gsap } from "gsap";
import { Star, Send, MessageCircle, CheckCircle } from "lucide-react";
import TurnstileWidget, { type TurnstileWidgetHandle } from "../components/TurnstileWidget";
import { submitPublicForm } from "../lib/publicForms";

const SB_URL = "https://egztpclpcnizcdtfugsv.supabase.co/rest/v1";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnenRwY2xwY25pemNkdGZ1Z3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODYwNTYsImV4cCI6MjA1ODY2MjA1Nn0.rY5yZ1zPNEW4bD2tU0HhYb5qJ_LCNeEJOqy9F7HnGXk";
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };
const PUBLIC_REVIEW_FIELDS = "id,reviewer_name,reviewer_type,rating,title,review_text,is_featured,is_partner_endorsement,response_text,created_at";

type Review = {
  id: string;
  reviewer_name: string;
  reviewer_type: string | null;
  rating: number;
  title: string | null;
  review_text: string;
  is_featured: boolean;
  is_partner_endorsement: boolean;
  response_text: string | null;
  created_at: string;
};

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ avg: "0", total: 0 });
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
    gsap.fromTo(".reviews-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
  }, []);

  async function loadReviews() {
    setIsLoadingReviews(true);
    setLoadError("");

    try {
      const r = await fetch(
        `${SB_URL}/v_public_customer_reviews?select=${PUBLIC_REVIEW_FIELDS}&order=is_featured.desc,created_at.desc`,
        { headers: H },
      );

      if (!r.ok) throw new Error(`Reviews request failed with status ${r.status}`);

      const data = (await r.json()) as Review[];
      const safeData = Array.isArray(data) ? data : [];
      setReviews(safeData);
      setStats(
        safeData.length
          ? { avg: (safeData.reduce((sum, review) => sum + review.rating, 0) / safeData.length).toFixed(1), total: safeData.length }
          : { avg: "0", total: 0 },
      );
    } catch (error) {
      console.error("Unable to load public customer reviews", error);
      setReviews([]);
      setStats({ avg: "0", total: 0 });
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

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

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

  const stars = (n: number) => Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} fill={i < n ? "#FFD700" : "none"} stroke={i < n ? "#FFD700" : "rgba(255,255,255,0.15)"} />);
  const fD = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const typeLabel: Record<string, string> = { residential: "Residential", business: "Business", hotel: "Hospitality", mdu: "Apartment", partner: "Partner", government: "Government" };

  return (
    <div className="px-4 sm:px-6 py-20 max-w-4xl mx-auto">
      <div className="text-center mb-16 reviews-title">
        <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "#fff", marginBottom: "12px" }}>
          What People Say
        </h1>
        <div style={{ height: "3px", width: "5rem", background: "linear-gradient(90deg, #00C7B1, #A3E635)", borderRadius: "2px", margin: "0 auto 16px", boxShadow: "0 0 12px rgba(0,199,177,0.5)" }} />
        {stats.total > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginTop: "12px" }}>
            <div style={{ display: "flex", gap: "2px" }}>{stars(Math.round(Number(stats.avg)))}</div>
            <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.3rem", color: "#FFD700" }}>{stats.avg}</span>
            <span style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>from {stats.total} reviews</span>
          </div>
        )}
      </div>

      {submitted && (
        <div style={{ background: "rgba(0,199,177,0.08)", border: "1px solid rgba(0,199,177,0.25)", borderRadius: "10px", padding: "24px", textAlign: "center", marginBottom: "24px" }}>
          <CheckCircle size={32} style={{ color: "#00C7B1", margin: "0 auto 8px" }} />
          <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, color: "#fff" }}>Thank you for your review!</p>
          <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>Your review will appear after approval.</p>
        </div>
      )}

      {!showForm && !submitted && (
        <div className="text-center mb-10">
          <button onClick={() => { setSubmitError(""); setShowForm(true); }} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 36px", background: "rgba(0,199,177,0.1)", border: "1px solid rgba(0,199,177,0.3)", borderRadius: "8px", color: "#00C7B1", fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.3s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,199,177,0.18)"; e.currentTarget.style.borderColor = "rgba(0,199,177,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,199,177,0.1)"; e.currentTarget.style.borderColor = "rgba(0,199,177,0.3)"; }}
          ><Send size={16} /> Leave a Review</button>
        </div>
      )}

      {showForm && (
        <div style={{ background: "rgba(0,199,177,0.03)", border: "1px solid rgba(0,199,177,0.15)", borderRadius: "10px", padding: "28px", marginBottom: "24px" }}>
          <h3 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.1rem", color: "#fff", marginBottom: "16px" }}>Share Your Experience</h3>
          <form onSubmit={submit} style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name *" required minLength={2} maxLength={120} style={{ padding: "10px 14px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontFamily: '"Nunito", sans-serif', fontSize: "0.85rem" }} />
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email (optional)" type="email" maxLength={254} style={{ padding: "10px 14px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontFamily: '"Nunito", sans-serif', fontSize: "0.85rem" }} />
            </div>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Review title" maxLength={160} style={{ padding: "10px 14px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontFamily: '"Nunito", sans-serif', fontSize: "0.85rem" }} />
            <textarea value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} placeholder="Your review *" required minLength={10} maxLength={4000} rows={4} style={{ padding: "10px 14px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontFamily: '"Nunito", sans-serif', fontSize: "0.85rem", resize: "vertical" }} />

            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div>
                <span style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginRight: "8px" }}>Rating:</span>
                {[1,2,3,4,5].map(n => <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}><Star size={20} fill={n <= form.rating ? "#FFD700" : "none"} stroke={n <= form.rating ? "#FFD700" : "rgba(255,255,255,0.2)"} /></button>)}
              </div>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontFamily: '"Nunito", sans-serif', fontSize: "0.8rem" }}>
                <option value="residential">Residential</option><option value="business">Business</option><option value="hotel">Hotel</option><option value="mdu">Apartment</option>
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
              <button type="submit" disabled={isSubmitting || !turnstileToken} style={{ padding: "12px 32px", borderRadius: "6px", border: "none", background: "#00C7B1", color: "#0a0a14", fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "0.85rem", cursor: isSubmitting || !turnstileToken ? "not-allowed" : "pointer", opacity: isSubmitting || !turnstileToken ? 0.65 : 1 }}>{isSubmitting ? "Submitting…" : "Submit Review"}</button>
              <button type="button" disabled={isSubmitting} onClick={() => { setSubmitError(""); setShowForm(false); }} style={{ padding: "12px 24px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", fontFamily: '"Nunito", sans-serif', fontSize: "0.85rem", cursor: isSubmitting ? "not-allowed" : "pointer" }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {isLoadingReviews && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(255,255,255,0.3)" }}>
          <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500 }}>Loading reviews…</p>
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
          {reviews.map(r => (
            <div key={r.id} style={{ background: "rgba(0,199,177,0.03)", border: `1px solid ${r.is_featured ? "rgba(0,199,177,0.2)" : "rgba(255,255,255,0.04)"}`, borderRadius: "10px", padding: "24px", transition: "border-color 0.3s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <div style={{ display: "flex", gap: "1px" }}>{stars(r.rating)}</div>
                    {r.is_partner_endorsement && <span style={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.08em", color: "#A3E635", border: "1px solid rgba(163,230,53,0.3)", padding: "2px 8px", borderRadius: "3px", background: "rgba(163,230,53,0.06)" }}>PARTNER</span>}
                    {r.is_featured && <span style={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.08em", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", padding: "2px 8px", borderRadius: "3px", background: "rgba(255,215,0,0.06)" }}>FEATURED</span>}
                  </div>
                  {r.title && <h4 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1rem", color: "#fff", marginBottom: "4px" }}>{r.title}</h4>}
                </div>
                <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>{fD(r.created_at)}</span>
              </div>
              <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.88rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "8px" }}>{r.review_text}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>{r.reviewer_name}</span>
                {r.reviewer_type && <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#00C7B1", border: "1px solid rgba(0,199,177,0.2)", padding: "1px 6px", borderRadius: "3px", background: "rgba(0,199,177,0.05)" }}>{typeLabel[r.reviewer_type] || r.reviewer_type}</span>}
              </div>

              {r.response_text && (
                <div style={{ marginTop: "12px", padding: "12px 16px", background: "rgba(0,199,177,0.05)", borderLeft: "2px solid #00C7B1", borderRadius: "0 6px 6px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <MessageCircle size={12} style={{ color: "#00C7B1" }} />
                    <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "0.7rem", color: "#00C7B1" }}>Tellinex Response</span>
                  </div>
                  <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{r.response_text}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!isLoadingReviews && !loadError && reviews.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(255,255,255,0.3)" }}>
          <MessageCircle size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500 }}>No reviews yet — be the first!</p>
        </div>
      )}
    </div>
  );
}
