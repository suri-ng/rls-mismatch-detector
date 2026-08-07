"use client";

import { ReconcileResult, Status } from "@/lib/types";
import { OperationPill } from "./OperationPill";

interface TableGroup {
  table: string;
  results: ReconcileResult[];
}

function groupByTable(results: ReconcileResult[]): TableGroup[] {
  const map = new Map<string, ReconcileResult[]>();
  for (const r of results) {
    const existing = map.get(r.table) ?? [];
    existing.push(r);
    map.set(r.table, existing);
  }
  return Array.from(map.entries())
    .map(([table, results]) => ({ table, results }))
    .sort((a, b) => a.table.localeCompare(b.table));
}

interface TableListProps {
  results: ReconcileResult[];
  statusFilter: Status | null;
  expandedTable: string | null;
  onToggleTable: (table: string) => void;
  selected: ReconcileResult | null;
  onSelectOperation: (result: ReconcileResult) => void;
}

export function TableList({
  results,
  statusFilter,
  expandedTable,
  onToggleTable,
  selected,
  onSelectOperation,
}: TableListProps) {
  const groups = groupByTable(results)
    .map((group) => ({
      ...group,
      results: statusFilter ? group.results.filter((r) => r.status === statusFilter) : group.results,
    }))
    .filter((group) => group.results.length > 0);

  return (
    <div className="overflow-hidden rounded-card bg-[#EEF2F6]">
      {groups.map((group, i) => {
        const isExpanded = expandedTable === group.table;

        return (
          <div
            key={group.table}
            className={[
              i < groups.length - 1 ? "border-b border-border" : "",
              isExpanded ? "border-l-[3px] border-l-frosty-teal" : "",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => onToggleTable(group.table)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#E2E8F0]/60"
            >
              <span
                className={[
                  "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-xs font-medium",
                  isExpanded ? "bg-frosty-teal text-white" : "bg-white text-muted",
                ].join(" ")}
              >
                {i + 1}
              </span>
              <span className="truncate font-mono text-sm font-medium text-code-line">
                {group.table}
              </span>
            </button>

            {isExpanded && (
              <div className="flex flex-wrap gap-1.5 px-4 pb-3.5 pl-[46px]">
                {group.results.map((r) => (
                  <OperationPill
                    key={r.operation}
                    operation={r.operation}
                    isSelected={
                      selected?.table === r.table && selected?.operation === r.operation
                    }
                    onClick={() => onSelectOperation(r)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}