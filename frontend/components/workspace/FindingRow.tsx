"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ReconcileResult } from "@/lib/types";
import { StatusIcon } from "./StatusIcon";
import { SeverityBadge } from "./SeverityBadge";
import { FindingDetail } from "./FindingDetail";

export function FindingRow({ result }: { result: ReconcileResult }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-card bg-surface p-6 shadow-card">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-start gap-4 text-left"
      >
        <StatusIcon status={result.status} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm text-code-line">
              {result.table}.{result.operation}
            </span>
            <SeverityBadge severity={result.severity} />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink">{result.explanation}</p>
        </div>

        <ChevronDown
          strokeWidth={1.5}
          size={18}
          className={`mt-1 shrink-0 text-muted transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && <FindingDetail result={result} />}
    </div>
  );
}