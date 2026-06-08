import React from "react";

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`glass rounded-xl p-5 shadow-panel ${className}`}>{children}</div>
  );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">{children}</div>;
}
