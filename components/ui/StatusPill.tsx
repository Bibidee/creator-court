import { Badge } from "./Badge";
import { STATUS_LABELS } from "../../lib/constants";

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "RESOLVED"
      ? "success"
      : status === "OPEN"
        ? "cyan"
        : status === "RESPONSE_SUBMITTED"
          ? "violet"
          : status === "CANCELLED"
            ? "danger"
            : "muted";
  return <Badge tone={tone}>{STATUS_LABELS[status] || status}</Badge>;
}
