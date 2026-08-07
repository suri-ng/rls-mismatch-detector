import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  let backendRes: Response;
  try {
    backendRes = await fetch(`${BACKEND_URL}/api/scan`, {
      method: "POST",
      body: formData,
    });
  } catch {
    return NextResponse.json(
      { error: "Couldn't reach the scan service. Is the backend running?" },
      { status: 500 }
    );
  }

  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}