"use client";

import { useCallback, useState } from "react";
import { FileDropzone } from "./FileDropzone";
import { FileListItem } from "./FileListItem";
import { UploadKind, validateNewFiles, Rejection, formatSize, MAX_FILE_SIZE_BYTES, MAX_FILES_PER_SIDE } from "@/lib/validation";

interface UploadPanelProps {
  title: string;
  hint: string;
  accept?: string;
  kind: UploadKind;
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export function UploadPanel({
  title,
  hint,
  accept,
  kind,
  files,
  onFilesChange,
}: UploadPanelProps) {
  const [rejections, setRejections] = useState<Rejection[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const addFiles = useCallback(
    (incoming: File[]) => {
      const existingKeys = new Set(files.map((f) => `${f.name}-${f.size}`));
      const deduped = incoming.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));

      const { accepted, rejections: newRejections } = validateNewFiles({
        existingFiles: files,
        incomingFiles: deduped,
        kind,
      });

      onFilesChange([...files, ...accepted]);
      setRejections(newRejections);
    },
    [files, kind, onFilesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(false);

      const items = e.dataTransfer.items;
      if (!items || items.length === 0) {
        addFiles(Array.from(e.dataTransfer.files));
        return;
      }

      const validFiles: File[] = [];
      const folderNames: string[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const entry = item.webkitGetAsEntry?.();
        if (entry?.isDirectory) {
          folderNames.push(entry.name);
          continue;
        }
        const file = item.getAsFile();
        if (file) validFiles.push(file);
      }

      if (folderNames.length > 0) {
        setRejections(
          folderNames.map((name) => ({
            name,
            reason: "Folders aren't supported — drop the individual files inside instead.",
          }))
        );
      }
      if (validFiles.length > 0) addFiles(validFiles);
    },
    [addFiles]
  );

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleDrop}
      className={[
        "rounded-card p-9 shadow-card transition-colors",
        isDragActive ? "bg-frosty-teal/5" : "bg-surface",
      ].join(" ")}
    >
      <div className="mb-5">
        <h2 className="text-base font-medium text-ink">{title}</h2>
        <p className="mt-1 text-sm text-muted">
          {hint} · up to {formatSize(MAX_FILE_SIZE_BYTES)} each, {MAX_FILES_PER_SIDE} files max
        </p>
      </div>

      <FileDropzone
        label={
          isDragActive
            ? "Release to add files"
            : files.length === 0
            ? "Drop files or click to browse"
            : "Add more files"
        }
        accept={accept}
        isDragActive={isDragActive}
        onFilesAdded={addFiles}
      />

      {rejections.length > 0 && (
        <div className="mt-4 flex flex-col gap-1.5">
          {rejections.map((r, i) => (
            <p key={`${r.name}-${i}`} className="text-sm text-red-600">
              <span className="font-mono">{r.name}</span> — {r.reason}
            </p>
          ))}
        </div>
      )}

      <div className="mt-4 flex h-28 flex-col gap-2 overflow-y-auto">
        {files.map((file, i) => (
          <FileListItem key={`${file.name}-${file.size}`} file={file} onRemove={() => removeFile(i)} />
        ))}
      </div>
    </div>
  );
}