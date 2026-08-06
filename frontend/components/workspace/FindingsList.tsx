import { ReconcileResult, Severity } from "@/lib/types";
import { FindingRow } from "./FindingRow";

const severityRank: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  none: 0,
};

export function FindingsList({ results }: { results: ReconcileResult[] }) {
  const sorted = [...results].sort(
    (a, b) => severityRank[b.severity] - severityRank[a.severity]
  );

  return (
    <div className="flex flex-col gap-4">
      {sorted.map((result) => (
        <FindingRow key={`${result.table}-${result.operation}`} result={result} />
      ))}
    </div>
  );
}