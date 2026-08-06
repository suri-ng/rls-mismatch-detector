"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

interface FileDropzoneProps {
  label: string;
  hint: string;
  accept?: string;
  multiple?: boolean;
  onFilesAdded: (files: File[]) => void;
}

export function FileDropzone({
  label,
  hint,
  accept,
  multiple = true,
  onFilesAdded,
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
      onDrop={(e) => {
        e.preventDefault();
        setIsDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={[
        "flex flex-col items-center justify-center gap-3 rounded-control border px-8 py-12 text-center transition-colors cursor-pointer",
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
        <p className="mt-1 text-xs text-muted">{hint}</p>
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
