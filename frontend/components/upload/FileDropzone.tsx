"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

interface FileDropzoneProps {
  label: string;
  hint?: string;
  accept?: string;
  multiple?: boolean;
  onFilesAdded: (files: File[]) => void;
  onFoldersDropped?: (folderNames: string[]) => void;
}

export function FileDropzone({
  label,
  hint,
  accept,
  multiple = true,
  onFilesAdded,
  onFoldersDropped,
}: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      onFilesAdded(Array.from(fileList));
    },
    [onFilesAdded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(false);
 
      const items = e.dataTransfer.items;
 
      // Plain file drops (most common case) have no directory entries to
      // worry about — fall back to the simple path.
      if (!items || items.length === 0) {
        handleFiles(e.dataTransfer.files);
        return;
      }
 
      const validFiles: File[] = [];
      const folderNames: string[] = [];
 
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        // webkitGetAsEntry is non-standard but supported in every major
        // browser — it's how we distinguish a dropped folder (which
        // .files silently ignores or mishandles) from a dropped file.
        const entry = item.webkitGetAsEntry?.();
 
        if (entry?.isDirectory) {
          folderNames.push(entry.name);
          continue;
        }
 
        const file = item.getAsFile();
        if (file) validFiles.push(file);
      }
 
      if (folderNames.length > 0) {
        onFoldersDropped?.(folderNames);
      }
      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
      }
    },
    [handleFiles, onFilesAdded, onFoldersDropped]
  );


  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleDrop}
      className={[
        "flex h-40 flex-col items-center justify-center gap-3 rounded-control border px-8 text-center transition-colors cursor-pointer",
        "bg-transparent",
        isDragActive
          ? "border-frosty-teal shadow-[inset_0_0_0_1px_rgba(13,148,136,0.35)]"
          : "border-border hover:border-muted",
      ].join(" ")}
    >
      <UploadCloud
        strokeWidth={1.5}
        className={isDragActive ? "text-frosty-teal" : "text-muted"}
        size={28}
      />
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}