import React from "react";

export function Select({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: string; label: string }[];
}) {
  return (
    <select
      {...props}
      className={`w-full rounded-md border border-white/10 bg-elevated px-3 py-2 text-sm text-ink focus:border-cyan/60 focus:outline-none ${props.className || ""}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-elevated">
          {o.label}
        </option>
      ))}
    </select>
  );
}
