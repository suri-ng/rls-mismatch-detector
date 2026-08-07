"""
Thin FastAPI wrapper around pipeline.runner.run_pipeline.

Place this file at the repo root, alongside cli.py — it imports from
pipeline.runner the same way cli.py does.

Run with:
    pip install fastapi uvicorn python-multipart
    uvicorn api:app --reload --port 8000
"""

import shutil
import tempfile
from pathlib import Path

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from pipeline.runner import run_pipeline

app = FastAPI(title="RLS Mismatch Detector API")

# The Next.js dev server calls this from the browser during local dev via
# its own /api/scan route acting as a proxy (server-to-server, so CORS
# doesn't strictly apply there) — but this is left permissive for local
# testing (e.g. hitting this endpoint directly from a browser or curl).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


def _save_uploads(files: list[UploadFile], target_dir: Path) -> list[str]:
    saved_paths: list[str] = []
    for upload in files:
        # Guard against a crafted filename escaping target_dir.
        safe_name = Path(upload.filename or "file").name
        dest = target_dir / safe_name
        with dest.open("wb") as f:
            shutil.copyfileobj(upload.file, f)
        saved_paths.append(str(dest))
    return saved_paths


@app.post("/api/scan")
async def scan(
    schema_files: list[UploadFile] | None = File(default=None),
    app_code_files: list[UploadFile] | None = File(default=None),
):
    if not schema_files or not app_code_files:
        return JSONResponse(
            status_code=400,
            content={"error": "Both schema files and app code files are required."},
        )

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        schema_dir = tmp_path / "schema"
        app_code_dir = tmp_path / "app_code"
        schema_dir.mkdir()
        app_code_dir.mkdir()

        try:
            schema_paths = _save_uploads(schema_files, schema_dir)
            app_code_paths = _save_uploads(app_code_files, app_code_dir)

            results = run_pipeline(
                schema_paths=schema_paths,
                app_code_paths=app_code_paths,
            )
        except Exception as exc:
            # Covers pipeline/LLM errors — missing API key, malformed
            # file content, etc. — per handoff §4's proposed 500 shape.
            return JSONResponse(
                status_code=500,
                content={"error": f"Scan failed: {exc}"},
            )

    return {
        "results": [
            r.model_dump() if hasattr(r, "model_dump") else r for r in results
        ]
    }