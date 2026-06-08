"use client";
// Lightweight client-side PDF export. We avoid pulling jspdf into the bundle to keep
// install size small. Instead, we open a new window with a printable view and trigger
// the browser's print-to-PDF. This is the recommended pattern for one-off reports.

import type { CopyCase, CaseResponse, OriginalWork, Verdict } from "./types";
import { VERDICT_LABELS } from "./constants";

function esc(s?: string): string {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function openCaseReport(c: CopyCase, work: OriginalWork | null, resp: CaseResponse | null, verdict: Verdict | null) {
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Case ${esc(c.case_id)} - Creator Court</title>
<style>
  body { font: 14px/1.5 -apple-system, system-ui, sans-serif; color: #111; padding: 32px; max-width: 760px; margin: auto; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 14px; margin: 24px 0 8px; text-transform: uppercase; letter-spacing: 0.06em; color: #555; }
  .meta { color: #666; font-size: 12px; }
  .pill { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; border: 1px solid #ccc; margin-right: 6px; }
  pre { background: #f5f5f5; padding: 10px; border-radius: 6px; white-space: pre-wrap; word-break: break-word; font-size: 12px; }
  .row { border-bottom: 1px solid #eee; padding: 6px 0; display: flex; justify-content: space-between; gap: 12px; font-size: 13px; }
  .row b { color: #444; font-weight: 500; min-width: 140px; }
  .disclaimer { color: #888; font-size: 11px; margin-top: 28px; border-top: 1px solid #eee; padding-top: 10px; }
</style></head><body>
<h1>Creator Court — Case report</h1>
<div class="meta">Case ID: ${esc(c.case_id)} · Status: ${esc(c.status)} · Generated ${new Date().toISOString()}</div>
<div style="margin-top:8px">
  <span class="pill">${esc(c.claim_type)}</span>
  ${verdict ? `<span class="pill">${esc(VERDICT_LABELS[verdict.verdict] || verdict.verdict)}</span><span class="pill">Confidence ${esc(verdict.confidence)}</span>` : ""}
</div>

<h2>Parties</h2>
<div class="row"><b>Claimant</b><span>${esc(c.claimant)}</span></div>
<div class="row"><b>Accused</b><span>${esc(c.accused_address || "unknown")} ${c.accused_handle ? "(@" + esc(c.accused_handle) + ")" : ""}</span></div>

<h2>Original work</h2>
${work ? `
<div class="row"><b>Title</b><span>${esc(work.title)}</span></div>
<div class="row"><b>Content type</b><span>${esc(work.content_type)}</span></div>
<div class="row"><b>Work ID</b><span>${esc(work.work_id)}</span></div>
<div class="row"><b>Content hash</b><span style="font-family:monospace">${esc(work.content_hash)}</span></div>
<div class="row"><b>Evidence CID</b><span style="font-family:monospace">${esc(work.evidence_cid)}</span></div>
${work.original_url ? `<div class="row"><b>Original URL</b><span>${esc(work.original_url)}</span></div>` : ""}
` : "<div>Original work record not loaded.</div>"}

<h2>Claim</h2>
<pre>${esc(c.claim_explanation)}</pre>
${c.comparison_notes ? `<h2>Comparison notes</h2><pre>${esc(c.comparison_notes)}</pre>` : ""}
${c.suspected_url ? `<div class="row"><b>Suspected URL</b><span>${esc(c.suspected_url)}</span></div>` : ""}
<div class="row"><b>Claim evidence CID</b><span style="font-family:monospace">${esc(c.evidence_cid)}</span></div>

<h2>Defence response</h2>
${resp ? `
<pre>${esc(resp.defence_statement)}</pre>
<div class="row"><b>Responder</b><span>${esc(resp.responder)}</span></div>
<div class="row"><b>Response evidence CID</b><span style="font-family:monospace">${esc(resp.evidence_cid)}</span></div>
` : "<div>No response submitted.</div>"}

<h2>Verdict</h2>
${verdict ? `
<div class="row"><b>Verdict</b><span>${esc(verdict.verdict)} (${esc(VERDICT_LABELS[verdict.verdict] || "")})</span></div>
<div class="row"><b>Confidence</b><span>${esc(verdict.confidence)}</span></div>
<h2 style="margin-top:14px">Summary</h2>
<pre>${esc(verdict.summary)}</pre>
${verdict.reasons?.length ? `<h2>Reasons</h2><ul>${verdict.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
${verdict.limitations?.length ? `<h2>Limitations</h2><ul>${verdict.limitations.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
<div class="row"><b>Reputation impact</b><span>Claimant ${verdict.reputation_impact?.claimant_delta >= 0 ? "+" : ""}${verdict.reputation_impact?.claimant_delta} · Accused ${verdict.reputation_impact?.accused_delta >= 0 ? "+" : ""}${verdict.reputation_impact?.accused_delta}</span></div>
` : "<div>No verdict yet.</div>"}

<div class="disclaimer">
  Creator Court provides public, evidence-based originality records and community-readable dispute verdicts.
  It does not provide legal advice. It does not replace courts, copyright offices, or platform moderation systems.
</div>
<script>window.onload = () => setTimeout(() => window.print(), 200);</script>
</body></html>`;

  const w = window.open("", "_blank", "noopener,width=800,height=900");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}
