"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Textarea } from "../../../components/ui/Textarea";
import { Field } from "../../../components/ui/Input";
import { FileUpload } from "../../../components/ui/FileUpload";
import { StatusPill } from "../../../components/ui/StatusPill";
import { EvidencePanel } from "../../../components/case/EvidencePanel";
import { VerdictPanel } from "../../../components/case/VerdictPanel";
import { CaseTimeline } from "../../../components/case/CaseTimeline";
import type { CopyCase, CaseResponse, OriginalWork, Verdict } from "../../../lib/types";
import { getCase, getResponse, getVerdict, getWork, requestVerdict, submitResponse } from "../../../lib/genlayer/contract";
import { connectWallet, explorerTxUrl, getConnectedAddress } from "../../../lib/genlayer/client";
import { uploadJSONToPinata } from "../../../lib/pinata";
import { shortAddr } from "../../../lib/format";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import { EmptyState } from "../../../components/ui/EmptyState";
import { toast } from "../../../components/ui/Toast";
import { openCaseReport } from "../../../lib/casePdf";

export default function CaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const [c, setC] = useState<CopyCase | null>(null);
  const [work, setWork] = useState<OriginalWork | null>(null);
  const [resp, setResp] = useState<CaseResponse | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // response form
  const [defence, setDefence] = useState("");
  const [respCid, setRespCid] = useState<string | null>(null);
  const [respName, setRespName] = useState<string | null>(null);
  const [actBusy, setActBusy] = useState(false);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const cs = await getCase(caseId);
      setC(cs);
      if (cs) {
        const [w, r, v] = await Promise.all([
          getWork(cs.original_work_id),
          getResponse(caseId),
          getVerdict(caseId),
        ]);
        setWork(w);
        setResp(r);
        setVerdict(v);
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to load case.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    getConnectedAddress().then(setMe);
  }, [caseId]);

  async function onSubmitResponse() {
    if (!c) return;
    setErr(null);
    setActBusy(true);
    try {
      let address = me;
      if (!address) address = await connectWallet();
      if (!address) throw new Error("Wallet not connected.");
      const pack = {
        version: "1.0" as const,
        original: { url: "", timestamp: "", screenshots: [], text_excerpt_hash: "" },
        defence_statement: defence,
        supporting_files: [respName].filter(Boolean) as string[],
        screenshots: [respCid].filter(Boolean) as string[],
        created_by: address,
        created_at: new Date().toISOString(),
      };
      const cid = await uploadJSONToPinata(pack);
      await submitResponse({
        case_id: c.case_id,
        defence_statement: defence,
        evidence_cid: cid,
        response_links_json: "[]",
      });
      await load();
      toast("Response submitted", "success");
      setDefence("");
      setRespCid(null);
      setRespName(null);
    } catch (e: any) {
      const msg = e?.message || "Failed to submit response.";
      toast(msg, "danger");
      setErr(msg);
    } finally {
      setActBusy(false);
    }
  }

  async function onRequestVerdict() {
    if (!c) return;
    setErr(null);
    setActBusy(true);
    try {
      await requestVerdict(c.case_id);
      await load();
      toast("Verdict published", "success");
    } catch (e: any) {
      const msg = e?.message || "Failed to request verdict.";
      toast(msg, "danger");
      setErr(msg);
    } finally {
      setActBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }
  if (err && !c) return <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-danger">{err}</div>;
  if (!c) return <EmptyState title="Case not found." hint="The case ID is wrong or the contract has not indexed it yet." />;

  const isClaimant = me && c.claimant && me.toLowerCase() === c.claimant.toLowerCase();
  const isAccused = me && c.accused_address && me.toLowerCase() === c.accused_address.toLowerCase();
  const canRespond = !resp && (c.status === "OPEN" || c.status === "RESPONSE_SUBMITTED") && (!c.accused_address || isAccused);
  const canRequestVerdict = !verdict && (isClaimant || !c.accused_address) && c.status !== "RESOLVED";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <StatusPill status={c.status as string} />
          <Badge tone="violet">{c.claim_type}</Badge>
          {verdict ? <Badge tone="success">Verdict: {verdict.verdict}</Badge> : null}
        </div>
        <h1 className="text-3xl font-bold">
          Case against {c.accused_handle || shortAddr(c.accused_address) || "unknown party"}
        </h1>
        <div className="mt-1 text-sm text-muted">
          Filed by{" "}
          <Link href={`/creator/${c.claimant}`} className="font-mono text-cyan hover:underline">
            {shortAddr(c.claimant)}
          </Link>
          {" · "}Case ID <span className="font-mono">{c.case_id}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardTitle>Claim</CardTitle>
            <p className="whitespace-pre-wrap text-sm text-ink/90">{c.claim_explanation || "No explanation provided."}</p>
            {c.comparison_notes ? (
              <>
                <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Comparison notes</div>
                <pre className="mt-1 whitespace-pre-wrap rounded-md border border-white/5 bg-bg/40 p-3 text-xs text-ink/90">{c.comparison_notes}</pre>
              </>
            ) : null}
            <div className="mt-4 grid gap-2 text-sm">
              {c.suspected_url ? (
                <div>
                  <div className="text-xs text-muted">Suspected copy URL</div>
                  <a href={c.suspected_url} target="_blank" rel="noreferrer" className="break-all text-cyan hover:underline">
                    {c.suspected_url}
                  </a>
                </div>
              ) : null}
              {work ? (
                <div>
                  <div className="text-xs text-muted">Linked original work</div>
                  <Link href={`/work/${work.work_id}`} className="text-cyan hover:underline">
                    {work.title}
                  </Link>
                </div>
              ) : null}
            </div>
            <div className="mt-4">
              <EvidencePanel cid={c.evidence_cid} label="Claim evidence bundle" />
            </div>
          </Card>

          <Card>
            <CardTitle>Defence response</CardTitle>
            {resp ? (
              <>
                <div className="text-sm whitespace-pre-wrap text-ink/90">{resp.defence_statement || "(no statement)"}</div>
                <div className="mt-1 text-xs text-muted">
                  Submitted by <span className="font-mono">{shortAddr(resp.responder)}</span>
                </div>
                <div className="mt-3">
                  <EvidencePanel cid={resp.evidence_cid} label="Response evidence" />
                </div>
              </>
            ) : canRespond ? (
              <div>
                <Field label="Your defence statement">
                  <Textarea rows={5} value={defence} onChange={(e) => setDefence(e.target.value)} placeholder="Explain independent creation, credit given, common idea, remix, or earlier proof." />
                </Field>
                <FileUpload
                  label="Upload response evidence"
                  onUploaded={(cid, name) => {
                    setRespCid(cid);
                    setRespName(name);
                  }}
                />
                <div className="mt-4">
                  <Button onClick={onSubmitResponse} disabled={actBusy}>
                    {actBusy ? "Submitting..." : "Submit response"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted">No response submitted yet.</div>
            )}
          </Card>

          <Card>
            <CardTitle>Verdict</CardTitle>
            {verdict ? (
              <VerdictPanel v={verdict} />
            ) : canRequestVerdict ? (
              <div>
                <p className="text-sm text-muted">
                  Ask GenLayer validators to read the case, the response, and the evidence, and publish a structured public verdict.
                </p>
                <div className="mt-4">
                  <Button onClick={onRequestVerdict} disabled={actBusy}>
                    {actBusy ? "Validators deliberating..." : "Request GenLayer verdict"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted">Waiting on response window or claimant action.</div>
            )}
          </Card>

          {err ? (
            <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{err}</div>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle>Parties</CardTitle>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-muted">Claimant</div>
                <Link href={`/creator/${c.claimant}`} className="font-mono text-cyan hover:underline">{shortAddr(c.claimant)}</Link>
              </div>
              <div>
                <div className="text-xs text-muted">Accused</div>
                {c.accused_address ? (
                  <Link href={`/creator/${c.accused_address}`} className="font-mono text-cyan hover:underline">{shortAddr(c.accused_address)}</Link>
                ) : (
                  <span className="text-muted">unknown</span>
                )}
                {c.accused_handle ? <div className="text-cyan">@{c.accused_handle}</div> : null}
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Timeline</CardTitle>
            <CaseTimeline c={c} response={resp} verdict={verdict} />
          </Card>

          <Card>
            <CardTitle>Share</CardTitle>
            <p className="text-xs text-muted">
              Copy the URL of this page to share the public case record. Verdicts are public proof, not legal judgements.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  if (typeof window === "undefined") return;
                  navigator.clipboard?.writeText(window.location.href);
                  toast("Case URL copied", "success");
                }}
              >
                Copy case URL
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (typeof window === "undefined") return;
                  const url = window.location.origin + `/respond/${c.case_id}`;
                  navigator.clipboard?.writeText(url);
                  toast("Response link copied", "success");
                }}
              >
                Copy response link for accused
              </Button>
              <Button variant="ghost" onClick={() => openCaseReport(c, work, resp, verdict)}>
                Export PDF report
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
