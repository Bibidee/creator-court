"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { EvidencePanel } from "../../../components/case/EvidencePanel";
import type { OriginalWork } from "../../../lib/types";
import { getWork } from "../../../lib/genlayer/contract";
import { shortAddr } from "../../../lib/format";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import { EmptyState } from "../../../components/ui/EmptyState";

export default function WorkPage({ params }: { params: Promise<{ workId: string }> }) {
  const { workId } = use(params);
  const [work, setWork] = useState<OriginalWork | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getWork(workId)
      .then((w) => setWork(w))
      .catch((e) => setErr(e?.message || "Failed to load work."))
      .finally(() => setLoading(false));
  }, [workId]);

  if (loading) {
    return <div className="mx-auto max-w-3xl space-y-4"><CardSkeleton /><CardSkeleton /></div>;
  }
  if (err) return <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-danger">{err}</div>;
  if (!work) return <EmptyState title="Work not found." hint="The work ID is wrong or has not been indexed yet." />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Badge tone="cyan">{work.content_type}</Badge>
          <Badge tone="muted">{work.status}</Badge>
        </div>
        <h1 className="text-3xl font-bold">{work.title}</h1>
        <div className="mt-1 text-sm text-muted">
          Registered by{" "}
          <Link href={`/creator/${work.creator}`} className="font-mono text-cyan hover:underline">
            {work.creator_handle ? `@${work.creator_handle}` : shortAddr(work.creator)}
          </Link>
        </div>
      </div>

      <Card>
        <CardTitle>Description</CardTitle>
        <p className="text-sm text-ink/90 whitespace-pre-wrap">{work.description || "No description provided."}</p>
        {work.original_url ? (
          <div className="mt-4">
            <div className="text-xs text-muted">Original URL</div>
            <a href={work.original_url} target="_blank" rel="noreferrer" className="break-all text-sm text-cyan hover:underline">
              {work.original_url}
            </a>
          </div>
        ) : null}
      </Card>

      <Card>
        <CardTitle>On-chain record</CardTitle>
        <div className="grid gap-2 text-sm">
          <Row label="Work ID" value={work.work_id} mono />
          <Row label="Content hash" value={work.content_hash} mono />
          <Row label="Created at (counter)" value={String(work.created_at)} />
        </div>
        <div className="mt-4">
          <EvidencePanel cid={work.evidence_cid} />
        </div>
      </Card>

      <div className="flex gap-3">
        <Link href={`/case/new?work=${encodeURIComponent(work.work_id)}`}>
          <Button>Open a copy case for this work</Button>
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/5 py-2 last:border-0">
      <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
      <span className={`text-right ${mono ? "font-mono" : ""} break-all`}>{value}</span>
    </div>
  );
}
