import Link from "next/link";
import { Badge } from "../components/ui/Badge";
import { VERDICT_LABELS, VERDICT_TONE } from "../lib/constants";

export default function HomePage() {
  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-grid-fade p-10 md:p-16">
        <div className="mb-3 flex items-center gap-2">
          <Badge tone="cyan">GenLayer-native</Badge>
          <Badge tone="violet">Originality protocol</Badge>
        </div>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Protect your ideas before the timeline forgets who made them first.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted md:text-lg">
          Register original work, open evidence-backed copy cases, and publish public GenLayer verdicts on
          originality, attribution, and copying. Evidence first. Judgement second. Public record always.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-md bg-gradient-to-r from-cyan to-violet px-5 py-2.5 text-sm font-semibold text-bg shadow-glow"
          >
            Register original work
          </Link>
          <Link
            href="/explore"
            className="rounded-md border border-white/15 px-5 py-2.5 text-sm font-semibold text-ink hover:border-cyan/50"
          >
            Explore cases
          </Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          { t: "Public originality proof", d: "Anchor titles, URLs, content hashes, and evidence CIDs on GenLayer before someone else claims them." },
          { t: "Evidence-based dispute protocol", d: "Open structured copy cases with screenshots, comparison notes, and timestamps. No timeline shouting matches." },
          { t: "Public verdict + reputation", d: "GenLayer adjudicates originality, attribution, and intent. Verdicts compound into creator reputation." },
        ].map((b) => (
          <div key={b.t} className="rounded-xl border border-white/10 bg-elevated/60 p-5">
            <div className="mb-2 h-1 w-10 rounded bg-gradient-to-r from-cyan to-violet" />
            <div className="text-sm font-semibold text-ink">{b.t}</div>
            <div className="mt-2 text-sm text-muted">{b.d}</div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-bold">How Creator Court works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["1", "Register work", "Title, URL, content hash, evidence pack on IPFS."],
            ["2", "Open a copy case", "Pick the suspected copy, attach comparison evidence, name the claim type."],
            ["3", "Defence window", "The accused party can respond with their own evidence and reasoning."],
            ["4", "GenLayer verdict", "Validators read everything and publish a structured public verdict."],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-xl border border-white/10 bg-elevated/60 p-5">
              <div className="mb-2 text-xs font-mono text-cyan">STEP {n}</div>
              <div className="text-sm font-semibold text-ink">{t}</div>
              <div className="mt-2 text-sm text-muted">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Verdict types</h2>
        <p className="mt-1 text-sm text-muted">
          Every case resolves into one of seven public labels with a confidence band.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {Object.keys(VERDICT_LABELS).map((k) => (
            <Badge key={k} tone={VERDICT_TONE[k as keyof typeof VERDICT_LABELS]}>
              {VERDICT_LABELS[k as keyof typeof VERDICT_LABELS]}
            </Badge>
          ))}
        </div>
      </section>

      <section className="grid gap-5 rounded-2xl border border-white/5 bg-elevated/40 p-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-bold">Example dispute</h3>
          <p className="mt-2 text-sm text-muted">
            A creator posts a Web3 explainer thread. Three days later, a near-identical thread appears with no credit.
            The creator opens a case, links the original work, uploads side-by-side screenshots, and requests a verdict.
            The accused party can respond. GenLayer publishes a public label with reasons.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-bg/60 p-5">
          <div className="flex items-center gap-2">
            <Badge tone="danger">Likely copied</Badge>
            <Badge tone="muted">Confidence: HIGH</Badge>
          </div>
          <div className="mt-3 text-sm text-ink">
            Specific examples and ordering are reused with minimal rewording. No credit link to the original thread.
            Later timestamp on a public account with no prior posts on this topic.
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/5 bg-grid-fade p-10">
        <h3 className="text-2xl font-bold">Build your originality record today.</h3>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Creator Court is not a legal copyright court. It is a public, evidence-based originality and attribution layer
          for internet creators.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-md bg-gradient-to-r from-cyan to-violet px-5 py-2.5 text-sm font-semibold text-bg shadow-glow"
          >
            Register original work
          </Link>
          <Link
            href="/case/new"
            className="rounded-md border border-white/15 px-5 py-2.5 text-sm font-semibold text-ink hover:border-violet/50"
          >
            Open a copy case
          </Link>
        </div>
      </section>
    </div>
  );
}
