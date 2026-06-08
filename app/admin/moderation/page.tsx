"use client";
import { useState } from "react";
import { Card, CardTitle } from "../../../components/ui/Card";
import { Field, Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { toast } from "../../../components/ui/Toast";

const FLAG_KEY = "creator_court.moderation_flags";

type Flag = { target: string; reason: string; at: string };

function read(): Flag[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(FLAG_KEY) || "[]");
  } catch {
    return [];
  }
}

function write(xs: Flag[]) {
  window.localStorage.setItem(FLAG_KEY, JSON.stringify(xs));
}

export default function ModerationPage() {
  const [target, setTarget] = useState("");
  const [reason, setReason] = useState("");
  const [flags, setFlags] = useState<Flag[]>(read());

  function add() {
    if (!target || !reason) return;
    const next = [{ target: target.trim(), reason: reason.trim(), at: new Date().toISOString() }, ...flags].slice(0, 200);
    setFlags(next);
    write(next);
    toast("Flag recorded locally", "success");
    setTarget("");
    setReason("");
  }

  function remove(i: number) {
    const next = flags.filter((_, idx) => idx !== i);
    setFlags(next);
    write(next);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Badge tone="warning">Moderation</Badge>
        <h1 className="mt-2 text-3xl font-bold">Moderation queue</h1>
        <p className="mt-2 text-sm text-muted">
          Flag works or cases whose off-chain content (titles, descriptions, evidence packs) violates the code of conduct.
          On-chain records are immutable and remain public. This view hides flagged items from the local explore cache.
        </p>
        <p className="mt-2 text-xs text-muted">
          MVP: flags are stored locally. Production: move to an admin contract or moderated indexer.
        </p>
      </div>

      <Card>
        <CardTitle>Flag a record</CardTitle>
        <Field label="Target ID" hint="Work ID (w_...) or case ID (c_...)">
          <Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="w_... or c_..." />
        </Field>
        <Field label="Reason">
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this being hidden from the UI?" />
        </Field>
        <Button onClick={add} disabled={!target || !reason}>Add flag</Button>
      </Card>

      <Card>
        <CardTitle>Active flags</CardTitle>
        {flags.length === 0 ? (
          <div className="text-sm text-muted">No flags recorded.</div>
        ) : (
          <ul className="space-y-2">
            {flags.map((f, i) => (
              <li key={i} className="flex items-start justify-between gap-3 rounded-md border border-white/10 bg-bg/40 p-3">
                <div className="min-w-0">
                  <div className="font-mono text-xs text-cyan">{f.target}</div>
                  <div className="text-sm text-ink">{f.reason}</div>
                  <div className="text-xs text-muted">{f.at}</div>
                </div>
                <Button variant="ghost" onClick={() => remove(i)}>Remove</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
