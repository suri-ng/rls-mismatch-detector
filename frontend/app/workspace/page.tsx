"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ReconcileResult, Status } from "@/lib/types";
import { FilterBar } from "@/components/workspace/FilterBar";
import { TableList } from "@/components/workspace/TableList";
import { DetailPanel } from "@/components/workspace/DetailPanel";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { EmptyState } from "@/components/feedback/EmptyState";

const severityRank: Record<ReconcileResult["severity"], number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  none: 0,
};

export default function Workspace() {
  const [results, setResults] = useState<ReconcileResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | null>(null);
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [selected, setSelected] = useState<ReconcileResult | null>(null);

  useEffect(() => {
    const storedError = sessionStorage.getItem("scan:error");
    const storedResults = sessionStorage.getItem("scan:results");

    if (storedError) {
      setError(storedError);
    } else if (storedResults) {
      const parsed: ReconcileResult[] = JSON.parse(storedResults);
      setResults(parsed);

      const sorted = [...parsed].sort(
        (a, b) => severityRank[b.severity] - severityRank[a.severity]
      );
      const top = sorted[0] ?? null;
      setSelected(top);
      setExpandedTable(top?.table ?? null);
    }
  }, []);

  const counts = useMemo<Record<Status, number>>(() => {
    const base = { MATCH: 0, MISMATCH: 0, UNKNOWN: 0 };
    for (const r of results ?? []) base[r.status] += 1;
    return base;
  }, [results]);

  const visibleResults = useMemo(() => {
    if (!results) return [];
    return statusFilter ? results.filter((r) => r.status === statusFilter) : results;
  }, [results, statusFilter]);

  // If the active filter hides whatever table was expanded/selected, fall
  // back to the first still-visible finding instead of a stale detail panel.
  useEffect(() => {
    if (!selected) return;
    const stillVisible = visibleResults.some(
      (r) => r.table === selected.table && r.operation === selected.operation
    );
    if (!stillVisible) {
      const next = visibleResults[0] ?? null;
      setSelected(next);
      setExpandedTable(next?.table ?? null);
    }
  }, [visibleResults, selected]);

  const handleToggleTable = (table: string) => {
    if (expandedTable === table) {
      setExpandedTable(null);
      return;
    }
    setExpandedTable(table);
    const firstInTable = visibleResults.find((r) => r.table === table);
    if (firstInTable) setSelected(firstInTable);
  };

  return (
    <main className="mx-auto max-w-[1400px] px-12 py-20">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-4xl tracking-tight text-ink">Results</h1>
        <Link
          href="/"
          className="rounded-control bg-glacier-gradient px-6 py-3 text-base font-medium text-white transition-opacity hover:opacity-90"
        >
          New scan
        </Link>
      </div>

      {error && (
        <div className="max-w-3xl">
          <ErrorBanner message={error} />
        </div>
      )}

      {!error && results && results.length > 0 && (
        <>
          <FilterBar
            counts={counts}
            total={results.length}
            activeFilter={statusFilter}
            onSelect={setStatusFilter}
          />

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_1fr]">
            <TableList
              results={results}
              statusFilter={statusFilter}
              expandedTable={expandedTable}
              onToggleTable={handleToggleTable}
              selected={selected}
              onSelectOperation={setSelected}
            />

            {selected ? (
              <DetailPanel result={selected} />
            ) : (
              <div className="rounded-card bg-surface p-8 shadow-card">
                <EmptyState
                  title="No findings in this filter"
                  message="Clear the filter above to see everything."
                />
              </div>
            )}
          </div>
        </>
      )}

      {!error && results && results.length === 0 && (
        <div className="max-w-3xl">
          <EmptyState
            title="No mismatches found"
            message="Every table and operation checked out clean."
            actionLabel="Run another scan"
            actionHref="/"
          />
        </div>
      )}

      {!error && !results && (
        <div className="max-w-3xl">
          <EmptyState
            title="No scan yet"
            message="Upload a schema and app code to see results here."
            actionLabel="Start a scan"
            actionHref="/"
          />
        </div>
      )}
    </main>
  );
}