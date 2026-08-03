from __future__ import annotations

from schemas.models import AccessClaim, EnforcementClaim, ReconcileResult


class ReconcilerAgent:
    """Placeholder reconciler that compares access and enforcement claims."""

    def run(
        self,
        access_claims: list[AccessClaim],
        enforcement_claims: list[EnforcementClaim],
    ) -> ReconcileResult:
        return ReconcileResult(
            status="MATCH",
            severity="LOW",
            summary="Placeholder reconciliation result.",
            access_claims=access_claims,
            enforcement_claims=enforcement_claims,
            notes=["Replace with real comparison logic."],
        )
