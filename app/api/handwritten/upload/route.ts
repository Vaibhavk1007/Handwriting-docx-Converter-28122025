

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
];

const HANDW_API_BASE = process.env.HANDW_API_BASE!;
const HANDW_API_KEY = process.env.HANDW_API_KEY!;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Please upload PDF, JPG, PNG, or GIF files only." },
        { status: 415 }
      );
    }

    /* ───────────────── FILE BUFFER ───────────────── */
    const buffer = Buffer.from(await file.arrayBuffer());

    /* ───────────────── SEND TO PYTHON BACKEND ───────────────── */
    const backendForm = new FormData();
    backendForm.append(
      "file",
      new Blob([buffer], { type: file.type }),
      file.name
    );

    const uploadRes = await fetch(
      `${HANDW_API_BASE}/api/upload`,
      {
        method: "POST",
        headers: {
          "x-api-key": HANDW_API_KEY,
        },
        body: backendForm,
      }
    );

    if (!uploadRes.ok) {
      const txt = await uploadRes.text();
      throw new Error(`Backend upload failed: ${txt}`);
    }

    const backendData = await uploadRes.json();
    const { filePath } = backendData;

    if (!filePath) {
      throw new Error("Backend did not return filePath");
    }

    /* ───────────────── PDF TYPE DETECTION ───────────────── */
    let pdfType: "digital" | "scanned" = "scanned";

    if (file.type === "application/pdf") {
      const detectForm = new FormData();
      detectForm.append(
        "file",
        new Blob([buffer], { type: "application/pdf" }),
        file.name
      );

      const detectRes = await fetch(
        `${HANDW_API_BASE}/api/detect-pdf-type`,
        {
          method: "POST",
          headers: {
            "x-api-key": HANDW_API_KEY,
          },
          body: detectForm,
        }
      );

      if (!detectRes.ok) {
        throw new Error("PDF detection failed");
      }

      const detectData = await detectRes.json();
      pdfType = detectData.type;
    }

    console.log("📄 PDF TYPE:", pdfType);

    /* ───────────────── DIGITAL PDF ───────────────── */
    if (pdfType === "digital") {
      return NextResponse.json({
        mode: "digital",
        filePath,
      });
    }

    /* ───────────────── SCANNED ───────────────── */
    return NextResponse.json({
      mode: "scanned",
      jobId: crypto.randomUUID(),
      filePath,
    });

  } catch (err: any) {
    console.error("🔥 upload error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}
