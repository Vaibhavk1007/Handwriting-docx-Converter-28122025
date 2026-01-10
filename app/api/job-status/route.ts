export const runtime = "nodejs";

const HANDW_API_BASE = process.env.HANDW_API_BASE!;
const HANDW_API_KEY = process.env.HANDW_API_KEY!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return new Response(
      JSON.stringify({ error: "jobId missing" }),
      { status: 400 }
    );
  }

  const res = await fetch(
    `${HANDW_API_BASE}/api/job-status?jobId=${jobId}`,
    {
        headers: {
        "x-api-key": HANDW_API_KEY,
        },
        cache: "no-store",
    }
    );

  const text = await res.text();

  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
