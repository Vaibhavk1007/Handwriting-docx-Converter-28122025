export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HANDW_API_BASE = process.env.HANDW_API_BASE!;
const HANDW_API_KEY = process.env.HANDW_API_KEY!;

export async function POST(req: Request) {
  console.log("➡️ [process-to-tiptap] START OCR JOB");

  try {
    const { jobId, filePath } = await req.json();

    // 🚫 Digital PDFs must never reach here
    if (!jobId) {
      return new Response(
        JSON.stringify({ error: "Digital PDFs cannot be processed" }),
        { status: 400 }
      );
    }

    if (!filePath) {
      return new Response(
        JSON.stringify({ error: "missing filePath" }),
        { status: 400 }
      );
    }

    /* ==================================================
       1️⃣ REGISTER JOB (CRITICAL)
       ================================================== */
    const registerRes = await fetch(
      `${HANDW_API_BASE}/api/job-register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": HANDW_API_KEY,
        },
        body: JSON.stringify({
          jobId,
          filePath,
          source: "scanned",
        }),
      }
    );

    if (!registerRes.ok) {
      const text = await registerRes.text();
      console.error("❌ Job register failed:", text);
      return new Response(
        JSON.stringify({ error: "failed to register job" }),
        { status: 500 }
      );
    }

    /* ==================================================
       2️⃣ START OCR (jobId ONLY)
       ================================================== */
    const processRes = await fetch(
      `${HANDW_API_BASE}/api/handwritten/process`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": HANDW_API_KEY,
        },
        body: JSON.stringify({ jobId }),
      }
    );

    if (!processRes.ok) {
      const text = await processRes.text();
      console.error("❌ Failed to start OCR:", text);
      return new Response(
        JSON.stringify({ error: "failed to start processing" }),
        { status: 500 }
      );
    }

    console.log("✅ OCR job started:", jobId);

    return new Response(
      JSON.stringify({ started: true }),
      { status: 200 }
    );

  } catch (err: any) {
    console.error("🔥 Process route error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || String(err) }),
      { status: 500 }
    );
  }
}
