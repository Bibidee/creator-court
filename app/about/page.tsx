import { Card, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

export const metadata = { title: "About — Creator Court" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Badge tone="cyan">About</Badge>
        <h1 className="mt-2 text-3xl font-bold">What Creator Court is, and what it is not.</h1>
        <p className="mt-2 text-muted">
          Creator Court is a public originality, evidence, and creator-dispute protocol built on GenLayer. It lets creators
          register original work, open evidence-backed copy cases, allow the accused party to respond, and publish a GenLayer-backed
          public verdict. Verdicts feed into creator reputation.
        </p>
      </div>

      <Card>
        <CardTitle>Plain language</CardTitle>
        <ul className="list-disc space-y-2 pl-5 text-sm text-ink/90">
          <li>This is public proof and a structured dispute record.</li>
          <li>This is not legal advice. Creator Court does not replace courts or copyright offices.</li>
          <li>Verdicts are GenLayer-issued public labels on originality and attribution, not legal judgements.</li>
          <li>Evidence files live off-chain on IPFS. Only CIDs, hashes, statuses, and verdict summaries live on-chain.</li>
        </ul>
      </Card>

      <Card>
        <CardTitle>Verdict labels</CardTitle>
        <ul className="list-disc space-y-2 pl-5 text-sm text-ink/90">
          <li>CONFIRMED_ORIGINAL — the original work stands; no copying found.</li>
          <li>LIKELY_COPIED — evidence strongly points to copying without sufficient credit.</li>
          <li>HEAVILY_INSPIRED — substantial similarity short of direct copying.</li>
          <li>PROPERLY_CREDITED_REMIX — the accused built on the work with fair credit.</li>
          <li>COMMON_IDEA — the similarity is generic in the field.</li>
          <li>INSUFFICIENT_EVIDENCE — the case lacks proof for a strong verdict.</li>
          <li>FALSE_CLAIM — the claim appears weak, exaggerated, or abusive.</li>
        </ul>
      </Card>

      <Card>
        <CardTitle>Use responsibly</CardTitle>
        <p className="text-sm text-muted">
          Do not upload private, doxxing, illegal, or sensitive personal data. Do not use Creator Court for harassment.
          Weak or abusive claims reduce your reputation score.
        </p>
      </Card>

      <Card>
        <CardTitle>Disclaimer</CardTitle>
        <p className="text-sm text-muted">
          Creator Court provides public, evidence-based originality records and community-readable dispute verdicts.
          It does not provide legal advice. It does not replace courts, copyright offices, or platform moderation systems.
          By using it you accept that case records are public.
        </p>
      </Card>
    </div>
  );
}
