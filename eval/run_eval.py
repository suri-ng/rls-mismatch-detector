from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from pipeline.runner import run_case


def run_eval() -> None:
    case_root = Path("test_cases")
    case_dirs = sorted([p for p in case_root.iterdir() if p.is_dir()])

    if not case_dirs:
        print("No test cases found.")
        return

    total = 0
    mismatches = 0

    for case_dir in case_dirs:
        total += 1
        app_code_path = case_dir / "app_code.js"
        schema_path = case_dir / "schema.sql"
        expected_path = case_dir / "expected.json"

        result = run_case(app_code_path, schema_path)
        expected = json.loads(expected_path.read_text(encoding="utf-8"))

        pred_status = result.status
        exp_status = expected.get("status")

        if pred_status != exp_status:
            mismatches += 1

        print(f"{case_dir.name}: predicted={pred_status}, expected={exp_status}")

    print(f"\nSummary: {total} cases, {mismatches} mismatches")


if __name__ == "__main__":
    run_eval()
