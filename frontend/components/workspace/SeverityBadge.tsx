import { Severity } from "@/lib/types";

const dotColor: Record<Severity, string> = {
  none: "bg-muted/50",
  low: "bg-frosty-teal",
  medium: "bg-amber-600",
  high: "bg-orange-600",
  critical: "bg-red-600",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-control bg-divider px-2.5 py-1 text-xs font-medium text-ink">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor[severity]}`} />
      {severity}
    </span>
  );
}