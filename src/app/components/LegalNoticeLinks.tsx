export default function LegalNoticeLinks() {
  return (
    <p
      style={{
        fontFamily: '"Nunito", sans-serif',
        fontSize: "0.75rem",
        color: "rgba(255,255,255,0.35)",
        textAlign: "center",
        marginTop: "24px",
      }}
    >
      <a href="/privacy" style={{ color: "#00C7B1", textDecoration: "none" }}>
        Privacy
      </a>
      <span style={{ margin: "0 8px" }}>·</span>
      <a href="/terms" style={{ color: "#00C7B1", textDecoration: "none" }}>
        Terms
      </a>
      <span style={{ margin: "0 8px" }}>·</span>
      <span>Draft — legal review required</span>
    </p>
  );
}
