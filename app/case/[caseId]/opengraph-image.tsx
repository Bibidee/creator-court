import { ImageResponse } from "next/og";
import { getCase, getVerdict } from "../../../lib/genlayer/contract";

export const runtime = "nodejs";
export const alt = "Creator Court case";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { caseId: string } }) {
  let title = "Creator Court case";
  let verdict = "";
  let confidence = "";
  // Best-effort RPC fetch with a hard 4s budget so the OG image route never hangs.
  try {
    const timeout = new Promise<null>((r) => setTimeout(() => r(null), 4000));
    const c = (await Promise.race([getCase(params.caseId), timeout])) as Awaited<ReturnType<typeof getCase>> | null;
    if (c) {
      title = `Case ${c.case_id.slice(0, 14)}…`;
      const v = (await Promise.race([getVerdict(params.caseId), timeout])) as Awaited<ReturnType<typeof getVerdict>> | null;
      if (v) {
        verdict = v.verdict.replace(/_/g, " ");
        confidence = v.confidence;
      }
    }
  } catch {
    // best effort - fall back to generic OG image
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "radial-gradient(900px 500px at 80% 0%, rgba(139,92,246,0.35), transparent 60%), radial-gradient(900px 500px at 20% 100%, rgba(34,211,238,0.3), transparent 60%), #050816",
          color: "#F8FAFC",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, fontWeight: 600 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#22D3EE,#8B5CF6)" }} />
          Creator Court
        </div>
        <div>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 1000 }}>{title}</div>
          {verdict ? (
            <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center" }}>
              <div
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  background: "linear-gradient(135deg,#22D3EE,#8B5CF6)",
                  color: "#050816",
                  fontSize: 26,
                  fontWeight: 700,
                }}
              >
                {verdict}
              </div>
              <div style={{ fontSize: 22, color: "#94A3B8" }}>Confidence: {confidence}</div>
            </div>
          ) : (
            <div style={{ marginTop: 24, fontSize: 22, color: "#94A3B8" }}>
              Evidence first. Judgement second. Public record always.
            </div>
          )}
        </div>
        <div style={{ fontSize: 18, color: "#94A3B8" }}>Public originality verdict on GenLayer</div>
      </div>
    ),
    size
  );
}
