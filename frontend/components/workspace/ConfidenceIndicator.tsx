export function ConfidenceIndicator({ confidence }: { confidence: number }) {
  if (confidence >= 0.7) return null;

  return <p className="mt-1 text-xs italic text-muted">Low confidence</p>;
}