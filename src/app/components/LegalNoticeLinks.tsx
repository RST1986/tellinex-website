export default function LegalNoticeLinks() {
  return (
    <p className="mt-6 text-center [font-family:var(--tlx-font-sans)] text-xs text-[var(--tlx-text-low)]">
      <a href="/privacy" className="text-[var(--tlx-primary)] no-underline">
        Privacy
      </a>
      <span className="mx-2">·</span>
      <a href="/terms" className="text-[var(--tlx-primary)] no-underline">
        Terms
      </a>
      <span className="mx-2">·</span>
      <span>Draft — legal review required</span>
    </p>
  );
}
