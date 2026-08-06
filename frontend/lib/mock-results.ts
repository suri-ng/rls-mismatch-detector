import { ReconcileResult } from "./types";

export const mockResults: ReconcileResult[] = [
  {
    table: "notes",
    operation: "SELECT",
    status: "MISMATCH",
    severity: "critical",
    explanation:
      "App code filters by user_id and assumes that is the only gate on who can read a note, but the RLS policy 'allow all reads' allows any authenticated (or anonymous) client to read every row directly via the auto-generated Supabase API, bypassing the app's filter entirely. Data exposure.",
    access_claim: {
      table: "notes",
      operation: "SELECT",
      assumed_condition: "user_id == current_user.id",
      source: "getNotes(): .eq('user_id', req.user.id)",
      bypasses_enforcement: false,
      confidence: 1.0,
    },
    enforcement_claim: {
      table: "notes",
      operation: "SELECT",
      enforced_condition: "true (unrestricted)",
      rls_enabled: true,
      source: 'policy "allow all reads" on notes',
      confidence: 1.0,
    },
  },
  {
    table: "profiles",
    operation: "UPDATE",
    status: "MATCH",
    severity: "none",
    explanation:
      "App code and RLS policy both restrict updates to the row owner. No gap found.",
    access_claim: {
      table: "profiles",
      operation: "UPDATE",
      assumed_condition: "id == current_user.id",
      source: "updateProfile(): .eq('id', req.user.id)",
      bypasses_enforcement: false,
      confidence: 0.95,
    },
    enforcement_claim: {
      table: "profiles",
      operation: "UPDATE",
      enforced_condition: "auth.uid() = id",
      rls_enabled: true,
      source: 'policy "own profile only" on profiles',
      confidence: 1.0,
    },
  },
  {
    table: "invoices",
    operation: "DELETE",
    status: "UNKNOWN",
    severity: "medium",
    explanation:
      "A DELETE policy exists on invoices, but no app code path was found that deletes invoices. This may be dead policy surface, or a deletion path (e.g. an admin tool) wasn't included in the scanned files.",
    access_claim: null,
    enforcement_claim: {
      table: "invoices",
      operation: "DELETE",
      enforced_condition: "auth.uid() = created_by",
      rls_enabled: true,
      source: 'policy "delete own invoices" on invoices',
      confidence: 1.0,
    },
  },
  {
    table: "audit_log",
    operation: "SELECT",
    status: "MISMATCH",
    severity: "high",
    explanation:
      "App code reads audit_log using a service-role key, bypassing RLS entirely. The RLS policy on this table is effectively decorative for this code path.",
    access_claim: {
      table: "audit_log",
      operation: "SELECT",
      assumed_condition: "none — service role used",
      source: "getAuditLog(): supabaseAdmin.from('audit_log').select('*')",
      bypasses_enforcement: true,
      confidence: 0.6,
    },
    enforcement_claim: {
      table: "audit_log",
      operation: "SELECT",
      enforced_condition: "auth.uid() = actor_id",
      rls_enabled: true,
      source: 'policy "own actions only" on audit_log',
      confidence: 1.0,
    },
  },
];