import type { CreatorProfile } from "../../lib/types";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { shortAddr, fmtCount } from "../../lib/format";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/5 bg-bg/50 px-3 py-2">
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className="text-lg font-semibold text-ink">{fmtCount(value)}</div>
    </div>
  );
}

export function CreatorProfileCard({ p }: { p: CreatorProfile }) {
  const score = p.reputation_score ?? 0;
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted">Creator</div>
          <div className="font-mono text-sm text-ink">{shortAddr(p.address)}</div>
          {p.handle ? <div className="text-sm text-cyan">@{p.handle}</div> : null}
        </div>
        <Badge tone={score > 0 ? "success" : score < 0 ? "danger" : "muted"}>
          Reputation {score >= 0 ? "+" : ""}{score}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Stat label="Works" value={p.total_works} />
        <Stat label="Cases opened" value={p.total_cases_opened} />
        <Stat label="Won" value={p.cases_won} />
        <Stat label="Lost" value={p.cases_lost} />
        <Stat label="False claims" value={p.false_claims} />
        <Stat label="Times accused" value={p.times_accused} />
        <Stat label="Confirmed originals" value={p.confirmed_originals} />
      </div>
    </Card>
  );
}
