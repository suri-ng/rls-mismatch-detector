from __future__ import annotations

from pathlib import Path

from schemas.models import AccessClaim


class AccessModelAgent:
    """Placeholder agent that reads app code and emits structured access claims."""

    def run(self, app_code_path: str | Path) -> list[AccessClaim]:
        app_code = Path(app_code_path).read_text(encoding="utf-8")

        # Placeholder: return a minimal structured response.
        return [
            AccessClaim(
                source="app_code",
                resource="unknown",
                operation="read",
                assumption="No app-side access assumptions extracted yet.",
                evidence=app_code[:200],
            )
        ]
