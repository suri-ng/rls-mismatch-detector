"use client";

import { useState } from "react";
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

  const addFiles = (incoming: File[]) => {
    const existingKeys = new Set(files.map((f) => `${f.name}-${f.size}`));
    const deduped = incoming.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));

    const { accepted, rejections: newRejections } = validateNewFiles({
      existingFiles: files,
      incomingFiles: deduped,
      kind,
    });

    onFilesChange([...files, ...accepted]);
    setRejections(newRejections);
  };

  const handleFoldersDropped = (folderNames: string[]) => {
    setRejections(
      folderNames.map((name) => ({
        name,
        reason: "Folders aren't supported — drop the individual files inside instead.",
      }))
    );
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-medium text-ink">{title}</h2>
        <p className="mt-0.5 text-xs text-muted">
          {hint} · up to {formatSize(MAX_FILE_SIZE_BYTES)} each, {MAX_FILES_PER_SIDE} files max
        </p>
      </div>

      <FileDropzone
        label={files.length === 0 ? "Drop files here or click to browse" : "Add more files"}
        accept={accept}
        onFilesAdded={addFiles}
        onFoldersDropped={handleFoldersDropped}
      />

      {rejections.length > 0 && (
        <div className="flex flex-col gap-1">
          {rejections.map((r, i) => (
            <p key={`${r.name}-${i}`} className="text-xs text-red-600">
              <span className="font-mono">{r.name}</span> — {r.reason}
            </p>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="flex max-h-48 flex-col gap-2 overflow-y-auto">
          {files.map((file, i) => (
            <FileListItem key={`${file.name}-${file.size}`} file={file} onRemove={() => removeFile(i)} />
          ))}
        </div>
      )}
    </div>
  );
}