"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadPanel } from "@/components/upload/UploadPanel";
import { ScanButton } from "@/components/upload/ScanButton";

export default function Home() {
  const router = useRouter();
  const [schemaFiles, setSchemaFiles] = useState<File[]>([]);
  const [appCodeFiles, setAppCodeFiles] = useState<File[]>([]);

  const canScan = schemaFiles.length > 0 && appCodeFiles.length > 0;

  const handleScan = () => {
    // Files themselves can't survive a route change in memory alone;
    // the actual submit + navigation wiring (POST to /api/scan, storing
    // results, then router.push) comes next once ScanningOverlay exists.
    router.push("/workspace");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-16 px-6 py-24">
      <div className="text-center">
        <h1 className="font-display text-4xl tracking-tight text-ink">
          RLS Mismatch Detector
        </h1>
        <p className="mt-3 text-sm text-muted">
          Drop your schema and app code. We'll find where they disagree.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2">
        <UploadPanel
          title="Schema"
          hint=".sql files"
          accept=".sql"
          files={schemaFiles}
          onFilesChange={setSchemaFiles}
        />
        <UploadPanel
          title="App code"
          hint="Any backend or frontend files"
          files={appCodeFiles}
          onFilesChange={setAppCodeFiles}
        />
      </div>

      <ScanButton disabled={!canScan} onClick={handleScan} />
    </main>
  );
}
