"use client";

import { FileDropzone } from "./FileDropzone";
import { FileListItem } from "./FileListItem";

interface UploadPanelProps {
  title: string;
  hint: string;
  accept?: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export function UploadPanel({
  title,
  hint,
  accept,
  files,
  onFilesChange,
}: UploadPanelProps) {
  const addFiles = (newFiles: File[]) => {
    // de-dupe by name+size, in case someone drops the same file twice
    const existingKeys = new Set(files.map((f) => `${f.name}-${f.size}`));
    const merged = [
      ...files,
      ...newFiles.filter((f) => !existingKeys.has(`${f.name}-${f.size}`)),
    ];
    onFilesChange(merged);
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-medium text-ink">{title}</h2>

      <FileDropzone
        label={files.length === 0 ? "Drop files here or click to browse" : "Add more files"}
        hint={hint}
        accept={accept}
        onFilesAdded={addFiles}
      />

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((file, i) => (
            <FileListItem key={`${file.name}-${file.size}`} file={file} onRemove={() => removeFile(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
