import Link from "next/link";

export function EmptyState({
  title,
  hint,
  cta,
  href,
}: {
  title: string;
  hint?: string;
  cta?: string;
  href?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-bg/40 p-8 text-center">
      <div className="mx-auto mb-3 h-1 w-12 rounded bg-gradient-to-r from-cyan to-violet" />
      <div className="text-sm font-semibold text-ink">{title}</div>
      {hint ? <div className="mx-auto mt-1 max-w-md text-xs text-muted">{hint}</div> : null}
      {cta && href ? (
        <Link
          href={href}
          className="mt-4 inline-block rounded-md border border-white/15 px-3 py-1.5 text-xs font-semibold text-ink hover:border-cyan/50"
        >
          {cta}
        </Link>
      ) : null}
    </div>
  );
}
