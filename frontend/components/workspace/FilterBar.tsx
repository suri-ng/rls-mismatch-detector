"use client";

import { Status } from "@/lib/types";

interface FilterBarProps {
  counts: Record<Status, number>;
  total: number;
  activeFilter: Status | null;
  onSelect: (status: Status | null) => void;
}

const segments: { status: Status | null; label: string }[] = [
  { status: null, label: "All" },
  { status: "MATCH", label: "Matches" },
  { status: "MISMATCH", label: "Mismatches" },
  { status: "UNKNOWN", label: "Unknowns" },
];

export function FilterBar({ counts, total, activeFilter, onSelect }: FilterBarProps) {
  return (
    <div
      className="mb-7 inline-flex items-center gap-0.5 rounded-full border-2 border-transparent p-1"
      style={{
        backgroundImage: "linear-gradient(#FFFFFF,#FFFFFF), linear-gradient(90deg,#0284C7,#0D9488)",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
      }}
    >
      {segments.map(({ status, label }) => {
        const isActive = activeFilter === status;
        const count = status === null ? total : counts[status];

        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(status)}
            className={[
              "rounded-full px-4 py-1.5 text-xs transition-colors",
              isActive ? "bg-ink font-semibold text-white" : "text-muted hover:bg-divider",
            ].join(" ")}
          >
            {label} {count}
          </button>
        );
      })}
    </div>
  );
}