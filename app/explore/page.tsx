"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardTitle } from "../../components/ui/Card";
import { Field, Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { getCase, getVerdict, getWork } from "../../lib/genlayer/contract";
import type { CopyCase, OriginalWork, Verdict } from "../../lib/types";
import { WorkCard } from "../../components/work/WorkCard";
import { CaseCard } from "../../components/case/CaseCard";
import { recentCases, recentWorks } from "../../lib/indexCache";
import { CLAIM_TYPES, CONTENT_TYPES, VERDICT_LABELS } from "../../lib/constants";

type Tab = "works" | "open" | "resolved" | "verdicts";

export default function ExplorePage() {
  const [tab, setTab] = useState<Tab>("works");
  const [loading, setLoading] = useState(true);
  const [works, setWorks] = useState<OriginalWork[]>([]);
  const [cases, setCases] = useState<CopyCase[]>([]);
  const [verdicts, setVerdicts] = useState<{ c: CopyCase; v: Verdict }[]>([]);

  // filters
  const [contentType, setContentType] = useState("");
  const [claimType, setClaimType] = useState("");
  const [verdictCode, setVerdictCode] = useState("");

  // lookup
  const [lookupId, setLookupId] = useState("");
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupErr, setLookupErr] = useState<string | null>(null);
  const [lookupWork, setLookupWork] = useState<OriginalWork | null>(null);
  const [lookupCase, setLookupCase] = useState<CopyCase | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const wIds = recentWorks();
      const cIds = recentCases();
      const [ws, cs] = await Promise.all([
        Promise.all(wIds.map((id) => getWork(id).catch(() => null))),
        Promise.all(cIds.map((id) => getCase(id).catch(() => null))),
      ]);
      const filteredWorks = ws.filter(Boolean) as OriginalWork[];
      const filteredCases = cs.filter(Boolean) as CopyCase[];
      setWorks(filteredWorks);
      setCases(filteredCases);
      const resolved = filteredCases.filter((c) => c.status === "RESOLVED");
      const vs = await Promise.all(
        resolved.map(async (c) => {
          const v = await getVerdict(c.case_id).catch(() => null);
          return v ? { c, v } : null;
        })
      );
      setVerdicts(vs.filter(Boolean) as { c: CopyCase; v: Verdict }[]);
      setLoading(false);
    })();
  }, []);

  const filteredWorks = useMemo(
    () => (contentType ? works.filter((w) => w.content_type === contentType) : works),
    [works, contentType]
  );
  const openCases = useMemo(() => {
    let xs = cases.filter((c) => c.status !== "RESOLVED" && c.status !== "CANCELLED");
    if (claimType) xs = xs.filter((c) => c.claim_type === claimType);
    return xs;
  }, [cases, claimType]);
  const resolvedCases = useMemo(() => {
    let xs = cases.filter((c) => c.status === "RESOLVED");
    if (claimType) xs = xs.filter((c) => c.claim_type === claimType);
    return xs;
  }, [cases, claimType]);
  const filteredVerdicts = useMemo(
    () => (verdictCode ? verdicts.filter((x) => x.v.verdict === verdictCode) : verdicts),
    [verdicts, verdictCode]
  );

  async function lookup() {
    setLookupErr(null);
    setLookupBusy(true);
    setLookupWork(null);
    setLookupCase(null);
    try {
      const id = lookupId.trim();
      if (id.startsWith("w_")) {
        const w = await getWork(id);
        if (!w) setLookupErr("No work found for that ID.");
        else setLookupWork(w);
      } else if (id.startsWith("c_")) {
        const cs = await getCase(id);
        if (!cs) setLookupErr("No case found for that ID.");
        else setLookupCase(cs);
      } else {
        setLookupErr("ID must start with w_ (work) or c_ (case).");
      }
    } catch (e: any) {
      setLookupErr(e?.message || "Lookup failed.");
    } finally {
      setLookupBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Explore</h1>
        <p className="mt-1 text-sm text-muted">
          Recent activity from this browser, plus contract lookup by ID. Source of truth is always the GenLayer contract.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["works", "open", "resolved", "verdicts"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium border ${
              tab === t ? "border-cyan/50 bg-cyan/15 text-cyan" : "border-white/10 text-muted hover:text-ink"
            }`}
          >
            {labelFor(t)}
          </button>
        ))}
      </div>

      <Card>
        <CardTitle>Filters</CardTitle>
        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="rounded-md border border-white/10 bg-elevated px-3 py-2 text-sm text-ink focus:border-cyan/60 focus:outline-none"
          >
            <option value="">All content types</option>
            {CONTENT_TYPES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            value={claimType}
            onChange={(e) => setClaimType(e.target.value)}
            className="rounded-md border border-white/10 bg-elevated px-3 py-2 text-sm text-ink focus:border-cyan/60 focus:outline-none"
          >
            <option value="">All claim types</option>
            {CLAIM_TYPES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            value={verdictCode}
            onChange={(e) => setVerdictCode(e.target.value)}
            className="rounded-md border border-white/10 bg-elevated px-3 py-2 text-sm text-ink focus:border-cyan/60 focus:outline-none"
          >
            <option value="">All verdicts</option>
            {Object.entries(VERDICT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : tab === "works" ? (
        filteredWorks.length ? (
          <div className="grid gap-3 md:grid-cols-2">{filteredWorks.map((w) => <WorkCard key={w.work_id} work={w} />)}</div>
        ) : (
          <EmptyState
            title="No works in your recent history yet."
            hint="Register an original work and it will show up here. Public lookup by ID still works below."
            cta="Register original work"
            href="/register"
          />
        )
      ) : tab === "open" ? (
        openCases.length ? (
          <div className="grid gap-3 md:grid-cols-2">{openCases.map((c) => <CaseCard key={c.case_id} c={c} />)}</div>
        ) : (
          <EmptyState title="No open cases yet." cta="Open a copy case" href="/case/new" />
        )
      ) : tab === "resolved" ? (
        resolvedCases.length ? (
          <div className="grid gap-3 md:grid-cols-2">{resolvedCases.map((c) => <CaseCard key={c.case_id} c={c} />)}</div>
        ) : (
          <EmptyState title="No resolved cases yet." hint="Resolved cases will appear here after a GenLayer verdict." />
        )
      ) : filteredVerdicts.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {filteredVerdicts.map(({ c, v }) => (
            <CaseCard key={c.case_id} c={{ ...c, verdict: v.verdict }} />
          ))}
        </div>
      ) : (
        <EmptyState title="No verdicts yet." hint="Open a case and request a verdict to populate this view." />
      )}

      <Card>
        <CardTitle>Lookup by ID</CardTitle>
        <p className="mb-3 text-xs text-muted">
          Public share unit. Paste a work ID (<code>w_...</code>) or case ID (<code>c_...</code>).
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <Field label="ID">
              <Input value={lookupId} onChange={(e) => setLookupId(e.target.value)} placeholder="w_... or c_..." />
            </Field>
          </div>
          <Button onClick={lookup} disabled={lookupBusy || !lookupId}>{lookupBusy ? "Looking up..." : "Lookup"}</Button>
        </div>
        {lookupErr ? <div className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{lookupErr}</div> : null}
        {lookupWork ? <div className="mt-4"><WorkCard work={lookupWork} /></div> : null}
        {lookupCase ? <div className="mt-4"><CaseCard c={lookupCase} /></div> : null}
      </Card>

      <div className="text-xs text-muted">
        <Badge tone="muted">Recent list is local to this browser</Badge>{" "}
        <Badge tone="cyan">Contract reads are live</Badge>
      </div>
    </div>
  );
}

function labelFor(t: Tab) {
  return t === "works"
    ? "Original works"
    : t === "open"
      ? "Open cases"
      : t === "resolved"
        ? "Resolved cases"
        : "Recent verdicts";
}
