"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardTitle } from "../../../components/ui/Card";
import { Field, Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { FileUpload } from "../../../components/ui/FileUpload";
import { Badge } from "../../../components/ui/Badge";
import { CLAIM_TYPES } from "../../../lib/constants";
import { newCaseId } from "../../../lib/ids";
import { uploadJSONToPinata } from "../../../lib/pinata";
import { openCopyCase } from "../../../lib/genlayer/contract";
import { connectWallet, getConnectedAddress, isContractConfigured } from "../../../lib/genlayer/client";
import { rememberCase } from "../../../lib/indexCache";
import { toast } from "../../../components/ui/Toast";

export default function NewCasePage() {
  return (
    <Suspense fallback={<div className="text-muted">Loading...</div>}>
      <NewCaseInner />
    </Suspense>
  );
}

function NewCaseInner() {
  const sp = useSearchParams();
  const [workId, setWorkId] = useState(sp.get("work") || "");
  const [suspectedUrl, setSuspectedUrl] = useState("");
  const [accusedAddress, setAccusedAddress] = useState("");
  const [accusedHandle, setAccusedHandle] = useState("");
  const [claimType, setClaimType] = useState(CLAIM_TYPES[0].value);
  const [explanation, setExplanation] = useState("");
  const [comparison, setComparison] = useState("");
  const [evidenceFileCid, setEvidenceFileCid] = useState<string | null>(null);
  const [evidenceFileName, setEvidenceFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ caseId: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!workId) return setErr("Enter the original work ID this case is about.");
    if (!suspectedUrl) return setErr("Provide a link to the suspected copy.");
    if (!evidenceFileCid) return setErr("Upload at least one piece of comparison evidence.");

    setBusy(true);
    try {
      let address = await getConnectedAddress();
      if (!address) address = await connectWallet();
      if (!address) throw new Error("Wallet not connected.");

      const pack = {
        version: "1.0" as const,
        original: { url: "", timestamp: "", screenshots: [], text_excerpt_hash: "" },
        suspected_copy: {
          url: suspectedUrl,
          timestamp: new Date().toISOString(),
          screenshots: [evidenceFileCid],
          text_excerpt_hash: "",
        },
        claimant_statement: explanation,
        comparison_notes: comparison.split("\n").map((s) => s.trim()).filter(Boolean),
        supporting_files: [evidenceFileName].filter(Boolean) as string[],
        created_by: address,
        created_at: new Date().toISOString(),
      };
      const evidenceCid = await uploadJSONToPinata(pack);
      const case_id = newCaseId();

      if (!isContractConfigured()) {
        throw new Error("NEXT_PUBLIC_CREATOR_COURT_CONTRACT_ADDRESS is not set.");
      }

      await openCopyCase({
        case_id,
        original_work_id: workId,
        suspected_url: suspectedUrl,
        accused_address: accusedAddress,
        accused_handle: accusedHandle,
        claim_type: claimType,
        claim_explanation: explanation,
        evidence_cid: evidenceCid,
        comparison_notes: comparison,
      });
      rememberCase(case_id);
      toast("Copy case opened on GenLayer", "success");
      setDone({ caseId: case_id });
    } catch (e: any) {
      const msg = e?.message || "Failed to open case.";
      toast(msg, "danger");
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <Badge tone="violet">Copy case opened</Badge>
          <h1 className="mt-3 text-2xl font-bold">Your case is on the public record.</h1>
          <p className="mt-2 text-sm text-muted">
            The accused party can now respond. When the defence window ends or a response arrives, you can request a GenLayer
            verdict.
          </p>
          <div className="mt-5 text-sm">
            <span className="text-muted">Case ID:</span> <span className="font-mono">{done.caseId}</span>
          </div>
          <div className="mt-6 flex gap-3">
            <Link href={`/case/${done.caseId}`}><Button>Open case page</Button></Link>
            <Link href="/explore"><Button variant="ghost">Back to explore</Button></Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Open a copy case</h1>
        <p className="mt-2 text-sm text-muted">
          Evidence first. Be specific about what was copied, where it appears, and how it compares to your original.
          Weak or abusive claims hurt your reputation.
        </p>
      </div>

      <form onSubmit={submit}>
        <Card>
          <CardTitle>Original work</CardTitle>
          <Field label="Original work ID" hint="Paste the ID from your work page.">
            <Input value={workId} onChange={(e) => setWorkId(e.target.value)} placeholder="w_..." />
          </Field>
        </Card>

        <div className="h-4" />

        <Card>
          <CardTitle>The suspected copy</CardTitle>
          <Field label="Suspected copy URL">
            <Input value={suspectedUrl} onChange={(e) => setSuspectedUrl(e.target.value)} placeholder="https://" />
          </Field>
          <Field label="Accused wallet address (optional)" hint="If known. Leave empty if the accused has no on-chain identity yet.">
            <Input value={accusedAddress} onChange={(e) => setAccusedAddress(e.target.value)} placeholder="0x..." />
          </Field>
          <Field label="Accused handle (optional)">
            <Input value={accusedHandle} onChange={(e) => setAccusedHandle(e.target.value)} placeholder="@theirhandle" />
          </Field>
          <Field label="Claim type">
            <Select value={claimType} onChange={(e) => setClaimType(e.target.value as any)} options={CLAIM_TYPES} />
          </Field>
          <Field label="Claim explanation">
            <Textarea rows={5} value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="What was copied, and why is this not a coincidence or common idea?" />
          </Field>
          <Field label="Comparison notes" hint="One observation per line. e.g. 'Reuses my example about X', 'Same ordering of points 1 to 5'.">
            <Textarea rows={4} value={comparison} onChange={(e) => setComparison(e.target.value)} />
          </Field>
        </Card>

        <div className="h-4" />

        <Card>
          <CardTitle>Comparison evidence</CardTitle>
          <p className="mb-3 text-xs text-muted">
            Side-by-side screenshots, archived pages, or a zip of supporting files. Pinned to IPFS via Pinata.
          </p>
          <FileUpload
            label="Upload comparison evidence"
            onUploaded={(cid, name) => {
              setEvidenceFileCid(cid);
              setEvidenceFileName(name);
            }}
          />
        </Card>

        {err ? <div className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{err}</div> : null}

        <div className="mt-6 flex gap-3">
          <Button disabled={busy}>{busy ? "Filing..." : "Open case"}</Button>
          <Link href="/"><Button type="button" variant="ghost">Cancel</Button></Link>
        </div>
      </form>
    </div>
  );
}
