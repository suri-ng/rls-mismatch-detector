"""
Quick smoke test -- run this in VS Code once you have a real OPENAI_API_KEY
in your .env file.
 
For each test case folder:
  1. Runs the Enforcement Agent on schema.sql
  2. Runs the Access-Model Agent on app_code.js
  3. Reconciles the first matching (table, operation) pair found in both
  4. Prints the result next to what expected.json says
 
This is NOT the eval script from the plan (that comes later, once you have
the full ~10-15 cases and want precision/recall) -- this is just "does the
real API actually work and produce something sane," one case at a time,
with full visibility into what each agent said.
 
Usage:
    python smoke_test.py                     # runs all test cases
    python smoke_test.py case_01_missing_rls  # runs just one
"""
 
import json
import sys
from pathlib import Path
 
from agents.enforcement_agent import run_enforcement_agent
from agents.access_model_agent import run_access_model_agent
from agents.reconciler_agent import run_reconciler
 
TEST_CASES_DIR = Path(__file__).parent / "test_cases"
 
 
def run_case(case_dir: Path) -> None:
    print(f"\n{'=' * 60}")
    print(f"CASE: {case_dir.name}")
    print("=" * 60)
 
    schema_sql = (case_dir / "schema.sql").read_text()
    app_code = (case_dir / "app_code.js").read_text()
 
    print("\n[1/3] Enforcement Agent output (EnforcementClaim, one per operation):")
    enforcement_claims = run_enforcement_agent(schema_sql)
    for c in enforcement_claims:
        print(c.model_dump_json(indent=2))
 
    print("\n[2/3] Access-Model Agent output (AccessClaim, one per operation):")
    access_claims = run_access_model_agent(app_code)
    for c in access_claims:
        print(c.model_dump_json(indent=2))
 
    if not enforcement_claims or not access_claims:
        print("\n  !! One of the agents returned zero claims -- nothing to reconcile.")
        return
 
    # For this smoke test, just reconcile the first (table, operation) pair
    # that appears on both sides. The real pipeline (Step 6) will do this
    # matching properly for every pair; this is just a quick sanity check.
    access = access_claims[0]
    matching_enforcement = next(
        (e for e in enforcement_claims
         if e.table == access.table and e.operation == access.operation),
        None,
    )
    if matching_enforcement is None:
        print(f"\n  !! No enforcement claim found for {access.table}.{access.operation.value}")
        return
 
    print("\n[3/3] Reconciler output (ReconcileResult):")
    result = run_reconciler(access, matching_enforcement)
    print(result.model_dump_json(indent=2))
 
    expected_path = case_dir / "expected.json"
    if expected_path.exists():
        expected = json.loads(expected_path.read_text())
        match = (
            result.status.value == expected["status"]
            and result.severity.value == expected["severity"]
        )
        print("\nexpected.json:")
        print(json.dumps(expected, indent=2))
        print(f"\n{'✅ MATCHES expected.json' if match else '❌ DOES NOT MATCH expected.json'}")
 
 
if __name__ == "__main__":
    if len(sys.argv) > 1:
        case_dirs = [TEST_CASES_DIR / sys.argv[1]]
    else:
        case_dirs = sorted(TEST_CASES_DIR.iterdir())
 
    for case_dir in case_dirs:
        if case_dir.is_dir():
            run_case(case_dir)
 
