"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ReconcileResult } from "@/lib/types";
import { FindingsList } from "@/components/workspace/FindingsList";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { EmptyState } from "@/components/feedback/EmptyState";

export default function Workspace() {
  const [results, setResults] = useState<ReconcileResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedError = sessionStorage.getItem("scan:error");
    const storedResults = sessionStorage.getItem("scan:results");

    if (storedError) {
      setError(storedError);
    } else if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
  }, []);

  return (
    <main className="mx-auto max-w-[1400px] px-12 py-20">
      <div className="mb-14 flex items-center justify-between">
        <h1 className="font-display text-4xl tracking-tight text-ink">Results</h1>
        <Link
          href="/"
          className="rounded-control bg-glacier-gradient px-6 py-3 text-base font-medium text-white transition-opacity hover:opacity-90"
        >
          New scan
        </Link>
      </div>

      <div className="max-w-3xl">
        {error && <ErrorBanner message={error} />}

        {!error && results && results.length > 0 && <FindingsList results={results} />}

        {!error && results && results.length === 0 && (
          <EmptyState
            title="No mismatches found"
            message="Every table and operation checked out clean."
            actionLabel="Run another scan"
            actionHref="/"
          />
        )}

        {!error && !results && (
          <EmptyState
            title="No scan yet"
            message="Upload a schema and app code to see results here."
            actionLabel="Start a scan"
            actionHref="/"
          />
        )}
      </div>
    </main>
  );
}