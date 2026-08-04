"""
Entrypoint for running the full pipeline on one test case's files.

Usage:
    from pipeline.runner import run_pipeline
    results = run_pipeline(schema_path="test_cases/case_01_missing_rls/schema.sql",
                            app_code_path="test_cases/case_01_missing_rls/app_code.js")
"""

from pathlib import Path

from pipeline.graph import build_graph
from schemas.models import ReconcileResult

_GRAPH = build_graph()


def run_pipeline(schema_path: str, app_code_path: str) -> list[ReconcileResult]:
    schema_sql = Path(schema_path).read_text()
    app_code = Path(app_code_path).read_text()

    final_state = _GRAPH.invoke({"schema_sql": schema_sql, "app_code": app_code})

    return final_state["results"]