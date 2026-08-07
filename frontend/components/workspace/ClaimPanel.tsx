import { LucideIcon } from "lucide-react";
import { ConfidenceIndicator } from "./ConfidenceIndicator";

interface ClaimPanelProps {
  title: string;
  accentColor: string;
  icon: LucideIcon;
  rounded: "left" | "right";
  condition?: string;
  source?: string;
  confidence?: number;
  emptyLabel: string;
}

export function ClaimPanel({
  title,
  accentColor,
  icon: Icon,
  rounded,
  condition,
  source,
  confidence,
  emptyLabel,
}: ClaimPanelProps) {
  return (
    <div
      className="h-full bg-canvas p-4"
      style={{
        borderTop: `2px solid ${accentColor}`,
        borderTopLeftRadius: rounded === "left" ? "10px" : 0,
        borderBottomLeftRadius: rounded === "left" ? "10px" : 0,
        borderTopRightRadius: rounded === "right" ? "10px" : 0,
        borderBottomRightRadius: rounded === "right" ? "10px" : 0,
      }}
    >
      <h3
        className="mb-2.5 text-xs font-semibold uppercase tracking-wide"
        style={{ color: accentColor }}
      >
        {title}
      </h3>

      {condition ? (
        <>
          <p className="mb-2.5 text-sm font-medium text-ink">{condition}</p>
          {source && (
            <span className="inline-flex items-center gap-1.5 rounded-control bg-surface px-2.5 py-1.5 text-xs">
              <Icon strokeWidth={1.5} size={13} className="text-muted" />
              <span className="font-mono text-code-line">{source}</span>
            </span>
          )}
          {confidence !== undefined && <ConfidenceIndicator confidence={confidence} />}
        </>
      ) : (
        <p className="text-sm italic text-muted">{emptyLabel}</p>
      )}
    </div>
  );
}