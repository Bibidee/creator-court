"use client";
import { useState } from "react";
import { uploadFileToPinata } from "../../lib/pinata";

export function FileUpload({
  label = "Upload evidence",
  onUploaded,
}: {
  label?: string;
  onUploaded: (cid: string, fileName: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [cid, setCid] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  async function handle(f: File) {
    setBusy(true);
    setErr(null);
    try {
      const c = await uploadFileToPinata(f);
      setCid(c);
      setName(f.name);
      onUploaded(c, f.name);
    } catch (e: any) {
      setErr(e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md border border-dashed border-white/15 bg-elevated/60 p-4">
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">{label}</div>
      <input
        type="file"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
        }}
        className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-gradient-to-r file:from-cyan file:to-violet file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-bg"
      />
      <div className="mt-2 text-xs">
        {busy && <span className="text-cyan">Uploading to IPFS via Pinata...</span>}
        {cid && !busy && (
          <span className="text-success">
            Pinned: <span className="font-mono">{cid.slice(0, 12)}…</span> ({name})
          </span>
        )}
        {err && <span className="text-danger">{err}</span>}
      </div>
    </div>
  );
}
