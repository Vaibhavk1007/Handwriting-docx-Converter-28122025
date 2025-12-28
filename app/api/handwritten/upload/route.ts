import fs from "fs/promises";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
];

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400 }
      );
    }

    /* ================= VALIDATION ================= */

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({
          error: "Unsupported file type",
          allowed: ALLOWED_MIME_TYPES,
        }),
        { status: 415 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return new Response(
        JSON.stringify({
          error: "File too large",
          maxSizeMB: MAX_FILE_SIZE_BYTES / (1024 * 1024),
        }),
        { status: 413 }
      );
    }

    /* ================= PREPARE STORAGE ================= */

    const jobId = uuidv4();
    const originalName =
      (file as any).name || `upload_${Date.now()}`;
    const safeName = sanitizeFilename(originalName);

    const uploadDir = path.join(
      os.tmpdir(),
      "handwritten_uploads"
    );

    await fs.mkdir(uploadDir, { recursive: true });

    const targetPath = path.join(
      uploadDir,
      `${jobId}_${safeName}`
    );

    /* ================= WRITE FILE ================= */

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(targetPath, buffer);

    console.log("⬆️ [upload] saved file:", targetPath);

    /* ================= RESPONSE ================= */

    return new Response(
      JSON.stringify({
        jobId,
        filePath: targetPath,
        mime: file.type,
        size: file.size,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("🔥 [upload] fatal error:", err);
    return new Response(
      JSON.stringify({
        error: err?.message || String(err),
      }),
      { status: 500 }
    );
  }
}
