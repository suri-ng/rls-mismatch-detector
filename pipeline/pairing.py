"""
Pairs up AccessClaims and EnforcementClaims by (table, operation) so every
combination either side mentions gets reconciled -- not just the first
match, which is all smoke_test.py checked.
 
Three cases per (table, operation):
  - present on both sides   -> run_reconciler produces a real MATCH/MISMATCH
  - present on ONE side only -> can't compare against nothing; returns an
    UNKNOWN result instead of silently dropping it. This matters: if the
    app code queries a table that has no schema.sql entry at all (or vice
    versa), that's worth surfacing, not ignoring.

The enforcement-only case needs care: "the app never queries this" does NOT
mean "this is low risk." Supabase auto-exposes every table via its REST API
regardless of whether your own app code ever touches it -- a table with RLS
disabled (or a wide-open policy) is dangerous purely by existing, whether or
not app_code.js happens to reference it. Severity here is driven by what the
enforcement claim actually says, not by the mere fact that it's one-sided.
"""
 
from schemas.models import (
    AccessClaim,
    EnforcementClaim,
    ReconcileResult,
    MismatchStatus,
    Severity,
)
from agents.reconciler_agent import run_reconciler, classify, ConditionCategory

def _severity_for_unmatched_enforcement(enforcement: EnforcementClaim) -> tuple[Severity, str]:
    """
    Decide how worried to be about an enforcement rule the app code never
    references, based on what that rule actually allows -- not on the fact
    that it's unreferenced.
    """
    category, _ = classify(enforcement.enforced_condition)
 
    if category == ConditionCategory.UNRESTRICTED:
        return (
            Severity.CRITICAL,
            (
                f"No application code references {enforcement.table} "
                f"({enforcement.operation.value}), but the database enforces no "
                f"restriction on it at all ({enforcement.enforced_condition!r}). "
                f"Because Supabase auto-exposes every table via its REST API "
                f"regardless of whether your app uses it, this table is reachable "
                f"and unrestricted for anyone right now."
            ),
        )
 
    if category == ConditionCategory.DEFAULT_DENY:
        return (
            Severity.LOW,
            (
                f"The schema denies {enforcement.table} ({enforcement.operation.value}) "
                f"by default (RLS enabled, no matching policy), and no application code "
                f"references it either. Likely genuinely unused -- low risk, but worth "
                f"confirming it isn't needed elsewhere."
            ),
        )
 
    # OWN_ROW_ONLY or CUSTOM: some real restriction exists, just unreferenced
    # by this app code. Not urgent, but not nothing -- flag for awareness.
    return (
        Severity.LOW,
        (
            f"The schema restricts {enforcement.table} ({enforcement.operation.value}) "
            f"via {enforcement.enforced_condition!r}, but no application code in the "
            f"provided files references it -- possibly used elsewhere, or dead policy."
        ),
    )

 
 
def pair_and_reconcile(
    access_claims: list[AccessClaim],
    enforcement_claims: list[EnforcementClaim],
) -> list[ReconcileResult]:
    access_by_key = {(c.table, c.operation): c for c in access_claims}
    enforcement_by_key = {(c.table, c.operation): c for c in enforcement_claims}
 
    all_keys = set(access_by_key) | set(enforcement_by_key)

    results: list[ReconcileResult] = []
    for table, operation in sorted(all_keys, key=lambda k: (k[0], k[1].value)):
        access = access_by_key.get((table, operation))
        enforcement = enforcement_by_key.get((table, operation))
 
        if access is not None and enforcement is not None:
            results.append(run_reconciler(access, enforcement))
        elif access is not None:
            results.append(
                ReconcileResult(
                    table=table,
                    operation=operation,
                    status=MismatchStatus.UNKNOWN,
                    severity=Severity.MEDIUM,
                    explanation=(
                        f"Application code queries {table} ({operation.value}), but "
                        f"no enforcement rule for this table/operation was found in "
                        f"the schema file -- cannot confirm what the database actually "
                        f"enforces here."
                    ),
                    access_claim=access,
                )
            )
        else:  # enforcement is not None, access is None
            severity, explanation = _severity_for_unmatched_enforcement(enforcement)
            results.append(
                ReconcileResult(
                    table=table,
                    operation=operation,
                    status=MismatchStatus.UNKNOWN,
                    severity=severity,
                    explanation=explanation,
                    enforcement_claim=enforcement,
                )
            )

 
    return results
 
