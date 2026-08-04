"""
Thin terminal entrypoint around pipeline.runner.run_pipeline.
 
Usage:
    python cli.py --case case_01_missing_rls
"""
 
import argparse
from pathlib import Path
 
from pipeline.runner import run_pipeline
 
TEST_CASES_DIR = Path(__file__).parent / "test_cases"
 
 
def main() -> None:
    parser = argparse.ArgumentParser(description="Run the RLS mismatch pipeline on a test case.")
    parser.add_argument(
        "--case",
        required=True,
        help="Test case folder name under test_cases/, e.g. case_01_missing_rls",
    )
    args = parser.parse_args()
 
    case_dir = TEST_CASES_DIR / args.case
    schema_path = case_dir / "schema.sql"
    app_code_path = case_dir / "app_code.js"
 
    if not schema_path.exists() or not app_code_path.exists():
        raise SystemExit(f"Case '{args.case}' is missing schema.sql or app_code.js under {case_dir}")
 
    results = run_pipeline(schema_path=str(schema_path), app_code_path=str(app_code_path))
 
    for r in results:
        print(f"\n{r.table}.{r.operation.value}: {r.status.value} / {r.severity.value}")
        print(f"  {r.explanation}")
 
 
if __name__ == "__main__":
    main()
 
