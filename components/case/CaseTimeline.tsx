import type { CopyCase, CaseResponse, Verdict } from "../../lib/types";

export function CaseTimeline({
  c,
  response,
  verdict,
}: {
  c: CopyCase;
  response: CaseResponse | null;
  verdict: Verdict | null;
}) {
  const steps = [
    { label: "Case opened", done: true, by: c.claimant },
    { label: "Response submitted", done: !!response, by: response?.responder },
    { label: "Verdict published", done: !!verdict, by: undefined },
  ];
  return (
    <ol className="relative space-y-4 border-l border-white/10 pl-5">
      {steps.map((s, i) => (
        <li key={i} className="relative">
          <span
            className={`absolute -left-[27px] top-1 inline-block h-3 w-3 rounded-full ${s.done ? "bg-gradient-to-br from-cyan to-violet" : "bg-white/10"}`}
          />
          <div className={`text-sm ${s.done ? "text-ink" : "text-muted"}`}>{s.label}</div>
          {s.by ? <div className="text-xs text-muted font-mono">{s.by}</div> : null}
        </li>
      ))}
    </ol>
  );
}
