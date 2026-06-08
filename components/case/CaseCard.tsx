import Link from "next/link";
import type { CopyCase } from "../../lib/types";
import { StatusPill } from "../ui/StatusPill";
import { Badge } from "../ui/Badge";
import { shortAddr } from "../../lib/format";

export function CaseCard({ c }: { c: CopyCase }) {
  return (
    <Link
      href={`/case/${c.case_id}`}
      className="block rounded-xl border border-white/10 bg-elevated/60 p-4 transition hover:border-violet/40 hover:bg-elevated"
    >
      <div className="mb-2 flex items-center gap-2">
        <StatusPill status={c.status as string} />
        <Badge tone="violet">{c.claim_type}</Badge>
        {c.verdict ? <Badge tone="success">{c.verdict}</Badge> : null}
      </div>
      <div className="line-clamp-2 text-base font-semibold text-ink">
        Case against {c.accused_handle || shortAddr(c.accused_address) || "unknown party"}
      </div>
      <div className="mt-1 line-clamp-2 text-xs text-muted">{c.claim_explanation}</div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>Claimant <span className="font-mono">{shortAddr(c.claimant)}</span></span>
        <span className="font-mono">{c.case_id.slice(0, 10)}…</span>
      </div>
    </Link>
  );
}
