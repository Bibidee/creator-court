"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardTitle } from "../../../components/ui/Card";
import { Field } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Button } from "../../../components/ui/Button";
import { FileUpload } from "../../../components/ui/FileUpload";
import { Badge } from "../../../components/ui/Badge";
import { StatusPill } from "../../../components/ui/StatusPill";
import { EvidencePanel } from "../../../components/case/EvidencePanel";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import { EmptyState } from "../../../components/ui/EmptyState";
import { toast } from "../../../components/ui/Toast";
import type { CopyCase, CaseResponse } from "../../../lib/types";
import { getCase, getResponse, submitResponse } from "../../../lib/genlayer/contract";
import { connectWallet, getConnectedAddress } from "../../../lib/genlayer/client";
import { uploadJSONToPinata } from "../../../lib/pinata";
import { shortAddr } from "../../../lib/format";

export default function RespondPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const [c, setC] = useState<CopyCase | null>(null);
  const [existing, setExisting] = useState<CaseResponse | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [defence, setDefence] = useState("");
  const [cid, setCid] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    getConnectedAddress().then(setMe);
    (async () => {
      const cs = await getCase(caseId).catch(() => null);
      setC(cs);
      const r = cs ? await getResponse(caseId).catch(() => null) : null;
      setExisting(r);
      setLoading(false);
    })();
  }, [caseId]);

  async function send() {
    if (!c) return;
    setBusy(true);
    setErr(null);
    try {
      let addr = me;
      if (!addr) addr = await connectWallet();
      if (!addr) throw new Error("Wallet not connected.");
      const pack = {
        version: "1.0" as const,
        original: { url: "", timestamp: "", screenshots: [], text_excerpt_hash: "" },
        defence_statement: defence,
        screenshots: [cid].filter(Boolean) as string[],
        supporting_files: [name].filter(Boolean) as string[],
        created_by: addr,
        created_at: new Date().toISOString(),
      };
      const evidenceCid = await uploadJSONToPinata(pack);
      await submitResponse({
        case_id: c.case_id,
        defence_statement: defence,
        evidence_cid: evidenceCid,
        response_links_json: "[]",
      });
      toast("Response submitted", "success");
      setDone(true);
    } catch (e: any) {
      const msg = e?.message || "Failed to submit response.";
      toast(msg, "danger");
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="mx-auto max-w-2xl"><CardSkeleton /></div>;
  if (!c) return <EmptyState title="Case not found." hint="Check the case ID and try again." />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="violet">Defence response</Badge>
          <StatusPill status={c.status as string} />
        </div>
        <h1 className="text-2xl font-bold">Respond to the case against you</h1>
        <div className="mt-1 text-sm text-muted">
          Case <span className="font-mono">{c.case_id}</span> · Claim type:{" "}
          <span className="text-ink">{c.claim_type}</span> · Filed by <span className="font-mono">{shortAddr(c.claimant)}</span>
        </div>
      </div>

      <Card>
        <CardTitle>The claim</CardTitle>
        <p className="whitespace-pre-wrap text-sm text-ink/90">{c.claim_explanation}</p>
        {c.suspected_url ? (
          <div className="mt-3 text-xs">
            <span className="text-muted">Suspected copy URL: </span>
            <a href={c.suspected_url} target="_blank" rel="noreferrer" className="text-cyan hover:underline">{c.suspected_url}</a>
          </div>
        ) : null}
        <div className="mt-3">
          <EvidencePanel cid={c.evidence_cid} label="Claim evidence" />
        </div>
      </Card>

      {done || existing ? (
        <Card>
          <Badge tone="success">Response on record</Badge>
          <p className="mt-3 text-sm text-muted">
            Your defence is public. The claimant or anyone with the case URL can now request a GenLayer verdict.
          </p>
          <div className="mt-4">
            <Link href={`/case/${c.case_id}`}><Button>Open full case page</Button></Link>
          </div>
        </Card>
      ) : (
        <Card>
          <CardTitle>Your defence</CardTitle>
          <p className="mb-3 text-xs text-muted">
            Explain independent creation, fair credit, earlier proof, or that this is a common idea. Add evidence files.
          </p>
          <Field label="Defence statement">
            <Textarea rows={6} value={defence} onChange={(e) => setDefence(e.target.value)} placeholder="Here is what actually happened..." />
          </Field>
          <FileUpload
            label="Upload response evidence"
            onUploaded={(c2, n) => { setCid(c2); setName(n); }}
          />
          {err ? <div className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{err}</div> : null}
          <div className="mt-5 flex gap-3">
            <Button onClick={send} disabled={busy || !defence}>{busy ? "Submitting..." : "Submit response"}</Button>
            <Link href={`/case/${c.case_id}`}><Button type="button" variant="ghost">Cancel</Button></Link>
          </div>
        </Card>
      )}
    </div>
  );
}
