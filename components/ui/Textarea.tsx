import React from "react";

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-md border border-white/10 bg-elevated px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-cyan/60 focus:outline-none ${props.className || ""}`}
    />
  );
}
