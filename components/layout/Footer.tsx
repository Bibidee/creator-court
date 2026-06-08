import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 text-xs text-muted">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 px-4 md:flex-row">
        <div>
          <div className="font-semibold text-ink">Creator Court</div>
          <div>Evidence first. Judgement second. Public record always.</div>
        </div>
        <div className="flex gap-4">
          <Link href="/about" className="hover:text-ink">About</Link>
          <Link href="/explore" className="hover:text-ink">Explore</Link>
          <Link href="/register" className="hover:text-ink">Register</Link>
        </div>
        <div className="opacity-70">
          Public originality protocol. Not legal advice.
        </div>
      </div>
    </footer>
  );
}
