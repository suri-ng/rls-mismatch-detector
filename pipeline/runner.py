"""
Entrypoint for running the full pipeline on one test case's files.

Usage:
    from pipeline.runner import run_pipeline
    results = run_pipeline(schema_path="test_cases/case_01_missing_rls/schema.sql",
                            app_code_path="test_cases/case_01_missing_rls/app_code.js")
"""

from pathlib import Path
from typing import Union

from pipeline.graph import build_graph
from schemas.models import ReconcileResult

_GRAPH = build_graph()

PathOrPaths = Union[str, list[str]]

def _read_and_label(paths: PathOrPaths) -> str:
    """
    Normalizes a single path or list of paths into one combined string,
    with a clear "=== FILE: <path> ===" marker before each file's content.
    Agents are told (in their prompts) to treat each marked section as a
    distinct file, and to note which file a claim's source comes from.
    """
    path_list = [paths] if isinstance(paths, str) else list(paths)
    sections = []
    for p in path_list:
        content = Path(p).read_text()
        sections.append(f"=== FILE: {p} ===\n{content}")
    return "\n\n".join(sections)
 
 
def run_pipeline(schema_paths: PathOrPaths, app_code_paths: PathOrPaths) -> list[ReconcileResult]:
    schema_sql = _read_and_label(schema_paths)
    app_code = _read_and_label(app_code_paths)
 
    final_state = _GRAPH.invoke({"schema_sql": schema_sql, "app_code": app_code})
 
    return final_state["results"]
 
