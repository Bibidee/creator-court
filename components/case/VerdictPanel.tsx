import type { Verdict } from "../../lib/types";
import { VERDICT_LABELS, VERDICT_TONE } from "../../lib/constants";
import { Badge } from "../ui/Badge";

export function VerdictPanel({ v }: { v: Verdict }) {
  const tone = VERDICT_TONE[v.verdict] || "muted";
  return (
    <div className="cyber-border relative rounded-xl bg-elevated/70 p-6">
      <div className="mb-3 flex items-center gap-2">
        <Badge tone={tone}>{VERDICT_LABELS[v.verdict] || v.verdict}</Badge>
        <Badge tone="muted">Confidence: {v.confidence}</Badge>
      </div>
      <p className="text-sm leading-relaxed text-ink/90">{v.summary}</p>
      {v.reasons?.length ? (
        <div className="mt-4">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Main reasons</div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink/90">
            {v.reasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      ) : null}
      {v.limitations?.length ? (
        <div className="mt-4">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Limitations</div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            {v.limitations.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </div>
      ) : null}
      <div className="mt-4 flex items-center gap-4 text-xs text-muted">
        <span>Claimant reputation: {v.reputation_impact?.claimant_delta >= 0 ? "+" : ""}{v.reputation_impact?.claimant_delta}</span>
        <span>Accused reputation: {v.reputation_impact?.accused_delta >= 0 ? "+" : ""}{v.reputation_impact?.accused_delta}</span>
      </div>
      <div className="mt-3 text-xs text-muted/80">
        This is a public originality and attribution verdict. It is not a legal judgement.
      </div>
    </div>
  );
}
