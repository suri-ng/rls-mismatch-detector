"""
Quick smoke test -- run this in VS Code once you have a real OPENAI_API_KEY
in your .env file.
 
For each test case folder, runs the FULL pipeline (pipeline.runner.run_pipeline)
-- both agents, then reconciliation across EVERY (table, operation) pair found
in either file, not just the first -- and compares every result against
expected.json.
 
expected.json can be either:
  - a single object   (one primary finding -- most cases so far)
  - a list of objects (multiple findings -- e.g. case_11, which
    deliberately covers three different operations in one case)
 
This is NOT the eval script from the plan (that comes later, once you want
precision/recall across the whole set) -- this is "does the real API
produce something sane," with full visibility into what each agent said.
 
Usage:
    python smoke_test.py                     # runs all test cases
    python smoke_test.py case_01_missing_rls  # runs just one
"""

import json
import sys
from pathlib import Path

from pipeline.runner import run_pipeline

TEST_CASES_DIR = Path(__file__).parent / "test_cases"


def _load_expected(case_dir: Path) -> list[dict]:
    """Always returns a list, whether expected.json is one object or many."""
    expected_path = case_dir / "expected.json"
    if not expected_path.exists():
        return []
    data = json.loads(expected_path.read_text())
    return data if isinstance(data, list) else [data]

def _discover_case_files(case_dir: Path) -> tuple[list[str], list[str]]:
    """
    Any .sql file in the case folder is a schema file. Everything else
    (except expected.json) is an app-code file. This lets a case folder
    hold multiple files per side without needing a manifest.
    """
    schema_paths = sorted(str(p) for p in case_dir.glob("*.sql"))
    app_code_paths = sorted(
        str(p) for p in case_dir.iterdir()
        if p.is_file() and p.suffix != ".sql" and p.name != "expected.json"
    )
    return schema_paths, app_code_paths


def run_case(case_dir: Path) -> None:
    print(f"\n{'=' * 60}")
    print(f"CASE: {case_dir.name}")
    print("=" * 60)

    schema_paths, app_code_paths = _discover_case_files(case_dir)
    print(f"\nSchema files: {schema_paths}")
    print(f"App-code files: {app_code_paths}")

    print("\nRunning full pipeline (Enforcement + Access-Model + Reconciler for every pair) ...")
    results = run_pipeline(schema_paths=schema_paths, app_code_paths=app_code_paths)

    expected_list = _load_expected(case_dir)
    expected_by_key = {(e["table"], e["operation"]): e for e in expected_list}
    seen_keys = set()

    for result in results:
        key = (result.table, result.operation.value)
        seen_keys.add(key)

        print(f"\n--- {result.table}.{result.operation.value} ---")
        print(result.model_dump_json(indent=2))

        expected = expected_by_key.get(key)
        if expected is None:
            print(f"  (no expected.json entry for {key} -- not checked)")
            continue

        match = (
            result.status.value == expected["status"]
            and result.severity.value == expected["severity"]
        )
        print(f"  expected: status={expected['status']} severity={expected['severity']}")
        print(f"  {'✅ MATCHES' if match else '❌ DOES NOT MATCH'} expected.json")

    missing = set(expected_by_key) - seen_keys
    for key in missing:
        print(f"\n  !! expected.json has an entry for {key} that the pipeline never produced")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        case_dirs = [TEST_CASES_DIR / sys.argv[1]]
    else:
        case_dirs = sorted(TEST_CASES_DIR.iterdir())

    for case_dir in case_dirs:
        if case_dir.is_dir():
            run_case(case_dir)