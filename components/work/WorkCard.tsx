import Link from "next/link";
import type { OriginalWork } from "../../lib/types";
import { Badge } from "../ui/Badge";
import { shortAddr } from "../../lib/format";

export function WorkCard({ work }: { work: OriginalWork }) {
  return (
    <Link
      href={`/work/${work.work_id}`}
      className="block rounded-xl border border-white/10 bg-elevated/60 p-4 transition hover:border-cyan/40 hover:bg-elevated"
    >
      <div className="mb-2 flex items-center gap-2">
        <Badge tone="cyan">{work.content_type}</Badge>
        <Badge tone="muted">{work.status}</Badge>
      </div>
      <div className="line-clamp-2 text-base font-semibold text-ink">{work.title}</div>
      <div className="mt-1 line-clamp-2 text-xs text-muted">{work.description}</div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span className="font-mono">{shortAddr(work.creator)}</span>
        <span className="font-mono">{work.work_id.slice(0, 10)}…</span>
      </div>
    </Link>
  );
}
