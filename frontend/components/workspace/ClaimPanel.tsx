import { ConfidenceIndicator } from "./ConfidenceIndicator";

interface ClaimPanelProps {
  title: string;
  condition?: string;
  source?: string;
  confidence?: number;
  emptyLabel: string;
}

export function ClaimPanel({
  title,
  condition,
  source,
  confidence,
  emptyLabel,
}: ClaimPanelProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
        {title}
      </h3>

      {condition ? (
        <>
          <p className="text-sm text-ink">{condition}</p>
          {source && (
            <p className="font-mono text-xs text-code-line">{source}</p>
          )}
          {confidence !== undefined && <ConfidenceIndicator confidence={confidence} />}
        </>
      ) : (
        <p className="text-sm italic text-muted">{emptyLabel}</p>
      )}
    </div>
  );
}