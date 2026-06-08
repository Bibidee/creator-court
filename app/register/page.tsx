"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardTitle } from "../../components/ui/Card";
import { Field, Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { FileUpload } from "../../components/ui/FileUpload";
import { Badge } from "../../components/ui/Badge";
import { CONTENT_TYPES } from "../../lib/constants";
import { newWorkId } from "../../lib/ids";
import { contentHashFromMetadata } from "../../lib/hash";
import { uploadJSONToPinata } from "../../lib/pinata";
import { registerOriginalWork } from "../../lib/genlayer/contract";
import { connectWallet, explorerTxUrl, getConnectedAddress, isContractConfigured } from "../../lib/genlayer/client";
import { rememberWork } from "../../lib/indexCache";
import { toast } from "../../components/ui/Toast";

export default function RegisterPage() {
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState(CONTENT_TYPES[0].value);
  const [originalUrl, setOriginalUrl] = useState("");
  const [description, setDescription] = useState("");
  const [creatorHandle, setCreatorHandle] = useState("");
  const [tags, setTags] = useState("");
  const [evidenceFileCid, setEvidenceFileCid] = useState<string | null>(null);
  const [evidenceFileName, setEvidenceFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ workId: string; txOrCid: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!title) return setErr("Title is required.");
    if (!evidenceFileCid) return setErr("Please upload at least one piece of evidence.");

    setBusy(true);
    try {
      let address = await getConnectedAddress();
      if (!address) address = await connectWallet();
      if (!address) throw new Error("Wallet not connected.");

      const evidencePack = {
        version: "1.0" as const,
        original: {
          url: originalUrl,
          timestamp: new Date().toISOString(),
          screenshots: [evidenceFileCid],
          text_excerpt_hash: "",
        },
        content_type: contentType,
        claimant_statement: description,
        supporting_files: [evidenceFileName].filter(Boolean) as string[],
        created_by: address,
        created_at: new Date().toISOString(),
      };
      const evidenceCid = await uploadJSONToPinata(evidencePack);
      const content_hash = await contentHashFromMetadata({
        title,
        content_type: contentType,
        original_url: originalUrl,
        description,
        creator_handle: creatorHandle,
      });
      const work_id = newWorkId();
      const tags_json = JSON.stringify(
        tags.split(",").map((t) => t.trim()).filter(Boolean)
      );

      if (!isContractConfigured()) {
        throw new Error(
          "NEXT_PUBLIC_CREATOR_COURT_CONTRACT_ADDRESS is not set. Deploy the contract and configure .env."
        );
      }

      const tx = await registerOriginalWork({
        work_id,
        title,
        content_type: contentType,
        original_url: originalUrl,
        description,
        evidence_cid: evidenceCid,
        content_hash,
        creator_handle: creatorHandle,
        tags_json,
      });
      rememberWork(work_id);
      toast("Work registered on GenLayer", "success");
      setDone({ workId: work_id, txOrCid: tx });
    } catch (e: any) {
      const msg = e?.message || "Registration failed.";
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
          <Badge tone="success">Originality record created</Badge>
          <h1 className="mt-3 text-2xl font-bold">Your work is on the public record.</h1>
          <p className="mt-2 text-sm text-muted">
            Share the public work page so the timeline knows who anchored this first.
          </p>
          <div className="mt-5 space-y-2 text-sm">
            <div><span className="text-muted">Work ID:</span> <span className="font-mono">{done.workId}</span></div>
            <div>
              <span className="text-muted">Tx:</span>{" "}
              <a href={explorerTxUrl(done.txOrCid)} target="_blank" rel="noreferrer" className="font-mono break-all text-cyan hover:underline">
                {done.txOrCid}
              </a>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Link href={`/work/${done.workId}`}><Button>Open work page</Button></Link>
            <Link href="/register"><Button variant="ghost">Register another</Button></Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Register original work</h1>
        <p className="mt-2 text-sm text-muted">
          Anchor the title, link, and an evidence pack now. If someone copies you later, you already have a public record
          and a CID-backed bundle.
        </p>
      </div>

      <form onSubmit={submit}>
        <Card>
          <CardTitle>Work details</CardTitle>
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. The Real Reason Web3 Threads Get Copied" />
          </Field>
          <Field label="Content type">
            <Select value={contentType} onChange={(e) => setContentType(e.target.value as any)} options={CONTENT_TYPES} />
          </Field>
          <Field label="Original URL" hint="A public link to where this work lives, if any.">
            <Input value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} placeholder="https://" />
          </Field>
          <Field label="Short description">
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this work and what makes it original?" />
          </Field>
          <Field label="Creator handle (optional)">
            <Input value={creatorHandle} onChange={(e) => setCreatorHandle(e.target.value)} placeholder="@yourhandle" />
          </Field>
          <Field label="Tags (comma separated, optional)">
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="thread, web3, originality" />
          </Field>
        </Card>

        <div className="h-4" />

        <Card>
          <CardTitle>Evidence</CardTitle>
          <p className="mb-3 text-xs text-muted">
            Upload a screenshot, PDF, or zip of the original content. The file is pinned to IPFS via Pinata. Do not upload
            private or sensitive personal data.
          </p>
          <FileUpload
            label="Upload evidence file"
            onUploaded={(cid, name) => {
              setEvidenceFileCid(cid);
              setEvidenceFileName(name);
            }}
          />
        </Card>

        {err ? <div className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{err}</div> : null}

        <div className="mt-6 flex gap-3">
          <Button disabled={busy}>{busy ? "Anchoring..." : "Register on GenLayer"}</Button>
          <Link href="/"><Button type="button" variant="ghost">Cancel</Button></Link>
        </div>
      </form>
    </div>
  );
}
