import { FileCode, Shield } from "lucide-react";
import { ReconcileResult } from "@/lib/types";
import { SeverityBadge } from "./SeverityBadge";
import { ClaimPanel } from "./ClaimPanel";
import { Connector } from "./Connector";
import { BypassCallout } from "./BypassCallout";
import { RlsDisabledCallout } from "./RlsDisabledCallout";

const GLACIER_BLUE = "#0284C7";
const FROSTY_TEAL = "#0D9488";

export function DetailPanel({ result }: { result: ReconcileResult }) {
  const { access_claim, enforcement_claim } = result;

  return (
    <div className="rounded-card bg-surface p-8 shadow-card">
      <div className="mb-3.5 flex items-center gap-3">
        <span className="font-mono text-[15px] font-semibold text-ink">
          {result.table}.{result.operation}
        </span>
        <SeverityBadge severity={result.severity} />
      </div>

      <div className="mb-7 border-l-2 border-divider pl-3.5">
        <p className="text-sm leading-relaxed text-ink">{result.explanation}</p>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch">
        <ClaimPanel
          title="App code assumes"
          accentColor={GLACIER_BLUE}
          icon={FileCode}
          rounded="left"
          condition={access_claim?.assumed_condition}
          source={access_claim?.source}
          confidence={access_claim?.confidence}
          emptyLabel="Not found in app code — only appears in the schema."
        />

        <Connector status={result.status} />

        <ClaimPanel
          title="Database enforces"
          accentColor={FROSTY_TEAL}
          icon={Shield}
          rounded="right"
          condition={enforcement_claim?.enforced_condition}
          source={enforcement_claim?.source}
          confidence={enforcement_claim?.confidence}
          emptyLabel="Not found in schema — only appears in app code."
        />
      </div>

      {(access_claim?.bypasses_enforcement ||
        (enforcement_claim && !enforcement_claim.rls_enabled)) && (
        <div className="mt-4 flex flex-col gap-2">
          {access_claim?.bypasses_enforcement && <BypassCallout />}
          {enforcement_claim && !enforcement_claim.rls_enabled && <RlsDisabledCallout />}
        </div>
      )}
    </div>
  );
}