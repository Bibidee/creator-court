"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardTitle } from "../../../components/ui/Card";
import { CreatorProfileCard } from "../../../components/creator/CreatorProfileCard";
import { getCase, getCreatorCases, getCreatorProfile, getCreatorWorks, getWork } from "../../../lib/genlayer/contract";
import type { CopyCase, CreatorProfile, OriginalWork } from "../../../lib/types";
import { WorkCard } from "../../../components/work/WorkCard";
import { CaseCard } from "../../../components/case/CaseCard";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import { EmptyState } from "../../../components/ui/EmptyState";

export default function CreatorPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [works, setWorks] = useState<OriginalWork[]>([]);
  const [cases, setCases] = useState<CopyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, workIds, caseIds] = await Promise.all([
          getCreatorProfile(address),
          getCreatorWorks(address),
          getCreatorCases(address),
        ]);
        setProfile(
          p || {
            address,
            handle: "",
            total_works: 0,
            total_cases_opened: 0,
            cases_won: 0,
            cases_lost: 0,
            false_claims: 0,
            times_accused: 0,
            confirmed_originals: 0,
            reputation_score: 0,
          }
        );
        const ws = await Promise.all(workIds.slice(0, 12).map(getWork));
        setWorks(ws.filter(Boolean) as OriginalWork[]);
        const cs = await Promise.all(caseIds.slice(0, 12).map(getCase));
        setCases(cs.filter(Boolean) as CopyCase[]);
      } catch (e: any) {
        setErr(e?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [address]);

  if (loading) {
    return <div className="space-y-4"><CardSkeleton /><CardSkeleton /></div>;
  }
  if (err) return <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-danger">{err}</div>;
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <CreatorProfileCard p={profile} />

      <Card>
        <CardTitle>Recent works</CardTitle>
        {works.length === 0 ? (
          <EmptyState title="No registered works yet." cta="Register original work" href="/register" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {works.map((w) => <WorkCard key={w.work_id} work={w} />)}
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>Recent cases</CardTitle>
        {cases.length === 0 ? (
          <EmptyState title="No cases involving this creator yet." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {cases.map((c) => <CaseCard key={c.case_id} c={c} />)}
          </div>
        )}
      </Card>

      <div className="text-xs text-muted">
        <Link href="/explore" className="hover:text-ink">← Back to explore</Link>
      </div>
    </div>
  );
}
