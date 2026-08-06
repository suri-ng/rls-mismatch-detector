import { Check, TriangleAlert, CircleHelp } from "lucide-react";
import { Status } from "@/lib/types";

const iconByStatus: Record<Status, typeof Check> = {
  MATCH: Check,
  MISMATCH: TriangleAlert,
  UNKNOWN: CircleHelp,
};

export function StatusIcon({ status }: { status: Status }) {
  const Icon = iconByStatus[status];
  return <Icon strokeWidth={1.5} size={18} className="shrink-0 text-ink" />;
}