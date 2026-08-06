"use client";

import { useRef } from "react";
import { UploadCloud } from "lucide-react";

interface FileDropzoneProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  isDragActive?: boolean;
  onFilesAdded: (files: File[]) => void;
}

export function FileDropzone({
  label,
  accept,
  multiple = true,
  isDragActive = false,
  onFilesAdded,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className={[
        "flex h-[190px] flex-col items-center justify-center gap-3 rounded-control border-[1.5px] border-dashed text-center transition-colors cursor-pointer",
        isDragActive ? "border-frosty-teal bg-frosty-teal/5" : "border-border hover:border-muted",
      ].join(" ")}
    >
      <UploadCloud
        strokeWidth={1.5}
        size={32}
        className={isDragActive ? "text-frosty-teal" : "text-muted"}
      />
      <p className={`text-base font-medium ${isDragActive ? "text-frosty-teal" : "text-ink"}`}>
        {label}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) onFilesAdded(Array.from(e.target.files));
          e.target.value = "";
        }}
      />
    </div>
  );
}