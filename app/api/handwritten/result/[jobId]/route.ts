import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  // ✅ MUST await params
  const { jobId } = await context.params;

  if (!jobId) {
    return NextResponse.json(
      { error: "Missing jobId" },
      { status: 400 }
    );
  }

  // Proxy to FastAPI
  const res = await fetch(
    `http://localhost:8001/result/${jobId}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Result not ready" },
      { status: 404 }
    );
  }

  const data = await res.json();

  if (!data?.html) {
    return NextResponse.json(
      { error: "Invalid result payload" },
      { status: 500 }
    );
  }

  return NextResponse.json({ html: data.html });
}
