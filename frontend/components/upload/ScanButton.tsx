"use client";

interface ScanButtonProps {
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}

export function ScanButton({ disabled, loading, onClick }: ScanButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={[
        "rounded-control px-6 py-3 text-sm font-medium transition-opacity",
        disabled || loading
          ? "bg-divider text-muted cursor-not-allowed"
          : "bg-glacier-gradient text-white hover:opacity-90",
      ].join(" ")}
    >
      {loading ? "Scanning..." : "Run Check"}
    </button>
  );
}
