import { NextRequest, NextResponse } from "next/server";
import { mockResults } from "@/lib/mock-results";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const schemaFiles = formData.getAll("schema_files");
  const appCodeFiles = formData.getAll("app_code_files");

  if (schemaFiles.length === 0 || appCodeFiles.length === 0) {
    return NextResponse.json(
      { error: "Both schema files and app code files are required." },
      { status: 400 }
    );
  }

  // Simulate the real pipeline's multi-second LLM latency (handoff §4)
  // so the loading state gets exercised honestly during development.
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // TODO: once the FastAPI wrapper around run_pipeline exists, replace
  // everything above this line with a proxied fetch to it, keeping this
  // route's request/response shape identical so no component changes.
  return NextResponse.json({ results: mockResults });
}