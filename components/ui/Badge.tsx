import React from "react";

type Tone = "cyan" | "violet" | "muted" | "danger" | "success" | "warning";

const map: Record<Tone, string> = {
  cyan: "bg-cyan/15 text-cyan border-cyan/30",
  violet: "bg-violet/15 text-violet-soft border-violet/30",
  muted: "bg-white/5 text-muted border-white/10",
  danger: "bg-danger/15 text-danger border-danger/30",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
};

export function Badge({ tone = "muted", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[tone]}`}>
      {children}
    </span>
  );
}
