export type PublicReviewView = {
  id: string;
  reviewerName: string;
  reviewerType: string | null;
  rating: number;
  title: string | null;
  reviewText: string;
  isFeatured: boolean;
  isPartnerEndorsement: boolean;
  responseText: string | null;
  createdAt: string;
};

const ALLOWED_TYPES = new Set([
  "residential",
  "business",
  "hotel",
  "mdu",
  "partner",
  "government",
]);

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, "").replace(/&[#a-zA-Z0-9]+;/g, " ").replace(/\s+/g, " ").trim();
}

function clip(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max);
}

export function sanitizePublicReview(raw: Record<string, unknown>): PublicReviewView | null {
  const id = typeof raw.id === "string" ? raw.id : "";
  const reviewText = typeof raw.review_text === "string" ? stripTags(raw.review_text) : "";
  if (!id || reviewText.length < 1) return null;

  const ratingRaw = typeof raw.rating === "number" ? raw.rating : Number(raw.rating);
  const rating = Number.isFinite(ratingRaw) ? Math.min(5, Math.max(1, Math.round(ratingRaw))) : 0;
  if (rating < 1) return null;

  const reviewerType = typeof raw.reviewer_type === "string" && ALLOWED_TYPES.has(raw.reviewer_type)
    ? raw.reviewer_type
    : null;

  return {
    id: clip(id, 80),
    reviewerName: clip(stripTags(typeof raw.reviewer_name === "string" ? raw.reviewer_name : "Customer"), 80),
    reviewerType,
    rating,
    title: typeof raw.title === "string" && raw.title.trim() ? clip(stripTags(raw.title), 160) : null,
    reviewText: clip(reviewText, 2000),
    isFeatured: raw.is_featured === true,
    isPartnerEndorsement: raw.is_partner_endorsement === true,
    responseText:
      typeof raw.response_text === "string" && raw.response_text.trim()
        ? clip(stripTags(raw.response_text), 2000)
        : null,
    createdAt: typeof raw.created_at === "string" ? raw.created_at : "",
  };
}
