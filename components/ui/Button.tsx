import React from "react";

type Variant = "primary" | "ghost" | "outline" | "danger";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
  const map: Record<Variant, string> = {
    primary:
      "bg-gradient-to-r from-cyan to-violet text-bg shadow-glow hover:opacity-90",
    ghost: "bg-white/5 text-ink hover:bg-white/10",
    outline: "border border-white/15 text-ink hover:border-cyan/50",
    danger: "bg-danger/90 text-bg hover:bg-danger",
  };
  return (
    <button className={`${base} ${map[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
