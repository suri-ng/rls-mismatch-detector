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
    <main className="mx-auto max-w-[1400px] px-12 py-20">
      <div className="mb-16 max-w-2xl">
        <h1 className="font-display text-6xl leading-tight tracking-tight text-ink">
          Find where your app and your database disagree
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Drop your schema and app code. We&apos;ll flag every table and
          operation where the two don&apos;t actually match.
        </p>
      </div>

      {isScanning ? (
        <ScanningOverlay />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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
              hint="Any source files"
              kind="appCode"
              files={appCodeFiles}
              onFilesChange={setAppCodeFiles}
            />
          </div>

          <div className="mt-8 flex justify-end">
            <ScanButton disabled={!canScan} loading={isScanning} onClick={handleScan} />
          </div>
        </>
      )}
    </main>
  );
}