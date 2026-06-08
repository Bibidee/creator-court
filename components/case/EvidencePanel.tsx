import { ipfsUrl } from "../../lib/format";

export function EvidencePanel({ cid, label = "Evidence bundle" }: { cid: string; label?: string }) {
  if (!cid) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-elevated/60 p-4">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className="break-all font-mono text-xs text-ink">{cid}</div>
      <a
        href={ipfsUrl(cid)}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-block text-xs text-cyan hover:underline"
      >
        Open on IPFS gateway
      </a>
    </div>
  );
}
