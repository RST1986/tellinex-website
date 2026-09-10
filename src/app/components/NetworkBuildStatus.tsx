import { LAUNCH_STATE, PUBLIC_LAUNCH_DATE, PILOT_CORRIDOR, CURRENT_COVERAGE } from "../content/commercialFacts";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

/**
 * Architecture-only public network-build status.
 * No fabricated percentages. No live coverage map.
 * Governed milestones only — currently none are approved for public progress bars.
 */
export default function NetworkBuildStatus() {
  return (
    <section
      aria-labelledby="network-build-status-heading"
      className="reveal-safe px-4 sm:px-6 py-16 max-w-5xl mx-auto"
    >
      <Card className="gap-0 border-[rgba(0,199,177,0.2)] bg-[rgba(0,199,177,0.04)] text-white shadow-none">
        <CardHeader className="gap-3 px-7 pt-7">
          <Badge
            variant="outline"
            className="border-lime-400/25 bg-lime-400/5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-lime-400"
          >
            {LAUNCH_STATE} · COMMERCIAL_LIVE=NO
          </Badge>
          <CardTitle
            id="network-build-status-heading"
            className="text-xl font-semibold leading-tight text-white"
          >
            Network build status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-7 pb-7 pt-3">
          <p className="text-[0.92rem] leading-relaxed text-white/55">
            {CURRENT_COVERAGE.value} {PILOT_CORRIDOR.value} Public launch date is not approved
            {PUBLIC_LAUNCH_DATE ? ` (${PUBLIC_LAUNCH_DATE})` : " (null)"}.
          </p>
          <p className="text-sm leading-relaxed text-white/35">
            No public completion percentage is published. Milestones appear here only after they are governed and approved.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
