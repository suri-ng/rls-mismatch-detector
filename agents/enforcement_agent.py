from __future__ import annotations

from pathlib import Path

from schemas.models import EnforcementClaim


class EnforcementAgent:
    """Placeholder agent that reads schema/RLS SQL and emits structured enforcement claims."""

    def run(self, schema_path: str | Path) -> list[EnforcementClaim]:
        schema_sql = Path(schema_path).read_text(encoding="utf-8")

        return [
            EnforcementClaim(
                source="schema",
                resource="unknown",
                policy="No enforcement claims extracted yet.",
                evidence=schema_sql[:200],
            )
        ]
