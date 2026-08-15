import { LAUNCH_STATE, LAUNCH_STATE_PUBLIC_LABEL, PUBLIC_LAUNCH_DATE, PILOT_CORRIDOR, CURRENT_COVERAGE } from "../content/commercialFacts";

/**
 * Architecture-only public network-build status.
 * No fabricated percentages. No live coverage map.
 * Governed milestones only — currently none are approved for public progress bars.
 */
export default function NetworkBuildStatus() {
  const launchDateCopy = PUBLIC_LAUNCH_DATE
    ? `Approved public launch date: ${PUBLIC_LAUNCH_DATE}.`
    : "A public launch date has not been approved.";

  return (
    <section
      aria-labelledby="network-build-status-heading"
      className="reveal-safe px-4 sm:px-6 py-16 max-w-5xl mx-auto"
    >
      <div
        style={{
          background: "rgba(0,199,177,0.04)",
          border: "1px solid rgba(0,199,177,0.2)",
          borderRadius: "10px",
          padding: "28px",
        }}
      >
        <p
          data-launch-state={LAUNCH_STATE}
          style={{
            fontFamily: "monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            color: "#A3E635",
            textTransform: "uppercase",
            marginBottom: "10px",
          }}
        >
          {LAUNCH_STATE} · {LAUNCH_STATE_PUBLIC_LABEL}
        </p>
        <h3
          id="network-build-status-heading"
          style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.25rem", color: "#fff", marginBottom: "10px" }}
        >
          Network under construction
        </h3>
        <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.92rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
          {CURRENT_COVERAGE.value} {PILOT_CORRIDOR.value} {launchDateCopy}
        </p>
        <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", marginTop: "12px" }}>
          No public completion percentage is published. Milestones appear here only after they are governed and approved.
        </p>
      </div>
    </section>
  );
}
