import { Check, TriangleAlert, CircleHelp } from "lucide-react";
import { Status } from "@/lib/types";
import { statusColor } from "@/lib/status-colors";

const LINE_COLOR = "#0D9488";

const iconByStatus = {
  MATCH: Check,
  MISMATCH: TriangleAlert,
  UNKNOWN: CircleHelp,
};

export function Connector({ status }: { status: Status }) {
  const Icon = iconByStatus[status];
  const color = statusColor[status];

  return (
    <div className="relative flex w-8 items-center justify-center">
      <div className="absolute inset-y-0 w-[2px]" style={{ backgroundColor: LINE_COLOR }} />
      <div
        className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-surface"
        style={{ border: `1.5px solid ${color}` }}
      >
        <Icon strokeWidth={1.5} size={14} style={{ color }} />
      </div>
    </div>
  );
}