"use client";

import { Operation } from "@/lib/types";

const pillColor: Record<Operation, string> = {
  SELECT: "#FDE2D3",
  INSERT: "#D9F2E3",
  UPDATE: "#DAEAFB",
  DELETE: "#E7E0FB",
};

const glowColor: Record<Operation, string> = {
  SELECT: "rgba(234,88,12,0.35)",
  INSERT: "rgba(21,128,61,0.30)",
  UPDATE: "rgba(2,132,199,0.30)",
  DELETE: "rgba(126,34,206,0.30)",
};

interface OperationPillProps {
  operation: Operation;
  isSelected?: boolean;
  onClick?: () => void;
}

export function OperationPill({ operation, isSelected = false, onClick }: OperationPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3 py-1 text-xs font-semibold text-ink transition-transform duration-150"
      style={{
        backgroundColor: pillColor[operation],
        boxShadow: isSelected
          ? "inset 0 1px 3px rgba(15,23,42,0.25)"
          : "0 1px 2px rgba(15,23,42,0.12)",
      }}
      onMouseEnter={(e) => {
        if (isSelected) return;
        e.currentTarget.style.transform = "scale(1.06)";
        e.currentTarget.style.boxShadow = `0 2px 4px rgba(15,23,42,0.12), 0 0 0 4px ${glowColor[operation]}`;
      }}
      onMouseLeave={(e) => {
        if (isSelected) return;
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 1px 2px rgba(15,23,42,0.12)";
      }}
    >
      {operation}
    </button>
  );
}