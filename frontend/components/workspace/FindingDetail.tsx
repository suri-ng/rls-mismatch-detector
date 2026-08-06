import { ReconcileResult } from "@/lib/types";
import { ClaimPanel } from "./ClaimPanel";
import { BypassCallout } from "./BypassCallout";
import { RlsDisabledCallout } from "./RlsDisabledCallout";

export function FindingDetail({ result }: { result: ReconcileResult }) {
  const { access_claim, enforcement_claim } = result;

  return (
    <div className="mt-4 flex flex-col gap-4 border-t border-divider pt-4">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <ClaimPanel
          title="App code assumes"
          condition={access_claim?.assumed_condition}
          source={access_claim?.source}
          confidence={access_claim?.confidence}
          emptyLabel="Not found in app code — only appears in the schema."
        />
        <ClaimPanel
          title="Database enforces"
          condition={enforcement_claim?.enforced_condition}
          source={enforcement_claim?.source}
          confidence={enforcement_claim?.confidence}
          emptyLabel="Not found in schema — only appears in app code."
        />
      </div>

      {access_claim?.bypasses_enforcement && <BypassCallout />}
      {enforcement_claim && !enforcement_claim.rls_enabled && <RlsDisabledCallout />}
    </div>
  );
}