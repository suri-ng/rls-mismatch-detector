"use client";

import { X } from "lucide-react";

interface FileListItemProps {
  file: File;
  onRemove: () => void;
}

export function FileListItem({ file, onRemove }: FileListItemProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-control bg-divider px-3 py-2">
      <span className="truncate font-mono text-xs text-code-line">{file.name}</span>
      <button
        type="button"
        aria-label={`Remove ${file.name}`}
        onClick={onRemove}
        className="text-muted transition-colors hover:text-ink"
      >
        <X strokeWidth={1.5} size={14} />
      </button>
    </div>
  );
}
