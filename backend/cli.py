"""
Thin terminal entrypoint around pipeline.runner.run_pipeline.
 
Usage:
    python cli.py --case case_01_missing_rls
 
    # or point directly at real files, one or more per side:
    python cli.py --schema db/schema.sql --app-code routes/notes.js
    python cli.py --schema db/schema.sql db/policies.sql \
                   --app-code routes/notes.js components/AdminPanel.jsx
"""
 
import argparse
from pathlib import Path
 
from pipeline.runner import run_pipeline
 
TEST_CASES_DIR = Path(__file__).parent / "test_cases"
 
 
def main() -> None:
    parser = argparse.ArgumentParser(description="Run the RLS mismatch pipeline.")
    parser.add_argument(
        "--case",
        help="Test case folder name under test_cases/, e.g. case_01_missing_rls",
    )
    parser.add_argument(
        "--schema", nargs="+", help="One or more schema.sql-style file paths"
    )
    parser.add_argument(
        "--app-code", nargs="+", help="One or more backend/frontend file paths"
    )
    args = parser.parse_args()
 
    if args.case:
        case_dir = TEST_CASES_DIR / args.case
        schema_paths = sorted(str(p) for p in case_dir.glob("*.sql"))
        app_code_paths = sorted(
            str(p) for p in case_dir.iterdir()
            if p.is_file() and p.suffix != ".sql" and p.name != "expected.json"
        )
        if not schema_paths or not app_code_paths:
            raise SystemExit(f"Case '{args.case}' is missing schema or app-code files under {case_dir}")
    elif args.schema and args.app_code:
        schema_paths = args.schema
        app_code_paths = args.app_code
    else:
        raise SystemExit("Provide either --case, or both --schema and --app-code.")
 
    results = run_pipeline(schema_paths=schema_paths, app_code_paths=app_code_paths)
 
    for r in results:
        print(f"\n{r.table}.{r.operation.value}: {r.status.value} / {r.severity.value}")
        print(f"  {r.explanation}")
 
 
if __name__ == "__main__":
    main()
 
