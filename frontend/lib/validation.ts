export const MAX_FILE_SIZE_BYTES = 300 * 1024; // 300 KB
export const MAX_FILES_PER_SIDE = 15;
export const MAX_TOTAL_SIZE_BYTES = 1.5 * 1024 * 1024; // 1.5 MB

export const SCHEMA_ALLOWED_EXTENSIONS = [".sql"];

// App code allows any extension EXCEPT these — binaries/media/archives
// aren't source the pipeline can read as text.
export const APP_CODE_BLOCKED_EXTENSIONS = [
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp", ".ico",
  ".mp4", ".mov", ".avi", ".mp3", ".wav",
  ".zip", ".rar", ".7z", ".tar", ".gz",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".exe", ".dll", ".so", ".bin",
  ".woff", ".woff2", ".ttf", ".eot",
];

export type UploadKind = "schema" | "appCode";

export interface Rejection {
  name: string;
  reason: string;
}

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx === -1 ? "" : filename.slice(idx).toLowerCase();
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateNewFiles({
  existingFiles,
  incomingFiles,
  kind,
}: {
  existingFiles: File[];
  incomingFiles: File[];
  kind: UploadKind;
}): { accepted: File[]; rejections: Rejection[] } {
  const rejections: Rejection[] = [];
  const accepted: File[] = [];

  let runningCount = existingFiles.length;
  let runningSize = existingFiles.reduce((sum, f) => sum + f.size, 0);

  for (const file of incomingFiles) {
    const ext = getExtension(file.name);

    if (kind === "schema" && !SCHEMA_ALLOWED_EXTENSIONS.includes(ext)) {
      rejections.push({ name: file.name, reason: "Only .sql files are accepted here." });
      continue;
    }

    if (kind === "appCode" && APP_CODE_BLOCKED_EXTENSIONS.includes(ext)) {
      rejections.push({
        name: file.name,
        reason: `${ext || "This file type"} isn't readable source — skip binaries and media.`,
      });
      continue;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      rejections.push({
        name: file.name,
        reason: `${formatSize(file.size)} is over the ${formatSize(MAX_FILE_SIZE_BYTES)} per-file limit — try splitting it into smaller files.`,
      });
      continue;
    }

    if (runningCount + 1 > MAX_FILES_PER_SIDE) {
      rejections.push({
        name: file.name,
        reason: `Limit of ${MAX_FILES_PER_SIDE} files reached.`,
      });
      continue;
    }

    if (runningSize + file.size > MAX_TOTAL_SIZE_BYTES) {
      rejections.push({
        name: file.name,
        reason: `Would push this side over the ${formatSize(MAX_TOTAL_SIZE_BYTES)} combined limit.`,
      });
      continue;
    }

    accepted.push(file);
    runningCount += 1;
    runningSize += file.size;
  }

  return { accepted, rejections };
}