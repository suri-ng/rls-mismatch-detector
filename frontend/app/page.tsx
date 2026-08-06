"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadPanel } from "@/components/upload/UploadPanel";
import { ScanButton } from "@/components/upload/ScanButton";
import { ScanningOverlay } from "@/components/feedback/ScanningOverlay";

export default function Home() {
  const router = useRouter();
  const [schemaFiles, setSchemaFiles] = useState<File[]>([]);
  const [appCodeFiles, setAppCodeFiles] = useState<File[]>([]);

  const [isScanning, setIsScanning] = useState(false);
  const canScan = schemaFiles.length > 0 && appCodeFiles.length > 0 && !isScanning;

  const handleScan = async () => {
    setIsScanning(true);

    const formData = new FormData();
    schemaFiles.forEach((f) => formData.append("schema_files", f));
    appCodeFiles.forEach((f) => formData.append("app_code_files", f));

    try {
      const res = await fetch("/api/scan", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        sessionStorage.removeItem("scan:results");
        sessionStorage.setItem("scan:error", data.error ?? "Something went wrong.");
        router.push("/workspace");
        return;
      }

      sessionStorage.removeItem("scan:error");
      sessionStorage.setItem("scan:results", JSON.stringify(data.results));
      router.push("/workspace");
    } catch {
      sessionStorage.removeItem("scan:results");
      sessionStorage.setItem("scan:error", "Couldn't reach the scan service. Try again.");
      router.push("/workspace");
    }
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

      {isScanning ? (
        <ScanningOverlay />
      ) : (
        <>
          <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2">
            <UploadPanel
              title="Schema"
              hint=".sql files"
              accept=".sql"
              kind="schema"
              files={schemaFiles}
              onFilesChange={setSchemaFiles}
            />
            <UploadPanel
              title="App code"
              hint="Any backend or frontend files"
              kind="appCode"
              files={appCodeFiles}
              onFilesChange={setAppCodeFiles}
            />
          </div>

          <ScanButton disabled={!canScan} loading={isScanning} onClick={handleScan} />
        </>
      )}
    </main>
  );
}