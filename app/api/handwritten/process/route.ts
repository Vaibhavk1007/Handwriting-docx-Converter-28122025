import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_HTML_SIZE = 300_000; // ~300KB safety cap
const FASTAPI_TIMEOUT_MS = 90_000;

function getMimeType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".gif") return "image/gif";
  return "image/png";
}

function isSafePath(filePath: string) {
  return !filePath.includes("..") && path.isAbsolute(filePath);
}

export async function POST(req: Request) {
  console.log("➡️ [process] POST called");

  try {
    const body = await req.json();

    const {
      filepath,
      filePath,
      strict = true,
      jobId,
    } = body as {
      filepath?: string;
      filePath?: string;
      strict?: boolean;
      jobId?: string;
    };

    const fileToUse = filepath ?? filePath;

    if (!fileToUse) {
      return new Response(
        JSON.stringify({ error: "missing filepath" }),
        { status: 400 }
      );
    }

    if (!isSafePath(fileToUse)) {
      console.error("❌ Unsafe filepath:", fileToUse);
      return new Response(
        JSON.stringify({ error: "invalid filepath" }),
        { status: 400 }
      );
    }

    console.log("📌 jobId:", jobId ?? "unknown");
    console.log("📄 processing file:", fileToUse);

    /* ================= READ FILE ================= */

    const buf = await fs.readFile(fileToUse);
    const imageBase64 = buf.toString("base64");
    const mime = getMimeType(fileToUse);

    /* ================= FASTAPI CALL ================= */

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      FASTAPI_TIMEOUT_MS
    );

    let res: Response;
    try {
      res = await fetch("http://localhost:8001/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          image_base64: buf.toString("base64"),
          mode: strict ? "strict" : "normal",
        }),
        signal: controller.signal,
      });
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.error("❌ FastAPI timeout");
        return new Response(
          JSON.stringify({ error: "Processing timeout" }),
          { status: 504 }
        );
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ FastAPI error:", text);
      return new Response(
        JSON.stringify({ error: "Inference failed", details: text }),
        { status: 500 }
      );
    }
    
    /* ================= PARSE RESPONSE ================= */

    let data: any;
    try {
      data = await res.json();
    } catch (e) {
      console.error("❌ Invalid FastAPI JSON");
      return new Response(
        JSON.stringify({ error: "Invalid FastAPI response" }),
        { status: 500 }
      );
    }

    if (!data?.jobId) {
      console.error("❌ FastAPI did not return jobId:", data);
      return new Response(
        JSON.stringify({ error: "FastAPI did not return jobId" }),
        { status: 500 }
      );
    }

    /* ================= SUCCESS ================= */

    return new Response(
      JSON.stringify({
        jobId: data.jobId,
        status: "queued",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (err: any) {
    console.error("🔥 Fatal process error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || String(err) }),
      { status: 500 }
    );
  }
}
