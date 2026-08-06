export type Status = "MATCH" | "MISMATCH" | "UNKNOWN";
export type Severity = "none" | "low" | "medium" | "high" | "critical";
export type Operation = "SELECT" | "INSERT" | "UPDATE" | "DELETE";

export interface AccessClaim {
  table: string;
  operation: Operation;
  assumed_condition: string;
  source: string;
  bypasses_enforcement: boolean;
  confidence: number;
}

export interface EnforcementClaim {
  table: string;
  operation: Operation;
  enforced_condition: string;
  rls_enabled: boolean;
  source: string;
  confidence: number;
}

export interface ReconcileResult {
  table: string;
  operation: Operation;
  status: Status;
  severity: Severity;
  explanation: string;
  access_claim: AccessClaim | null;
  enforcement_claim: EnforcementClaim | null;
}

export interface ScanResponse {
  results: ReconcileResult[];
}

export interface ScanErrorResponse {
  error: string;
}