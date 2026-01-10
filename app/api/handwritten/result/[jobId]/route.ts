import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


const HANDW_API_BASE = process.env.HANDW_API_BASE!;
const HANDW_API_KEY = process.env.HANDW_API_KEY!;


export async function GET(
  req: Request,
  context: { params: { jobId: string } }
) {
  const { jobId } = context.params;

  if (!jobId) {
    return NextResponse.json(
      { error: "Missing jobId" },
      { status: 400 }
    );
  }

  // const BACKEND_URL = "http://127.0.0.1:8000";

  let res: Response;
  try {
   res = await fetch(
  `${HANDW_API_BASE}/api/job-status?jobId=${jobId}`,
      {
        cache: "no-store",
        headers: {
          "x-api-key": HANDW_API_KEY,
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Backend unreachable" },
      { status: 503 }
    );
  }

  if (!res.ok) {
    if (res.status === 404) {
      return NextResponse.json(
        { status: "queued" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Backend error" },
      { status: 502 }
    );
  }

  const data = await res.json();

  if (data.status === "queued" || data.status === "processing") {
    return NextResponse.json(data, { status: 200 });
  }

  if (data.status === "failed") {
    return NextResponse.json(data, { status: 500 });
  }

  if (data.status === "completed") {
    if (!data.document || data.document.type !== "doc") {
      return NextResponse.json(
        { error: "Invalid document returned", data },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "completed",
        contentJson: data.document,
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    { error: "Unknown job state", data },
    { status: 500 }
  );
}
