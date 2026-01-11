// import fs from "fs/promises";
// import path from "path";
// import os from "os";
// import { PDFParse } from "pdf-parse";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";
// // import { detectPdfType } from "@/lib/pdfDetect";
// const ALLOWED_MIME_TYPES = [
//   "image/jpeg",
//   "image/png",
//   "image/gif",
//   "application/pdf",
// ];

// function sanitizeFilename(name: string) {
//   return name.replace(/[^a-zA-Z0-9._-]/g, "_");
// }


// const HANDW_API_BASE = process.env.HANDW_API_BASE!;
// const HANDW_API_KEY = process.env.HANDW_API_KEY!;



// export async function POST(req: Request) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("file");

//     if (!(file instanceof File)) {
//       return new Response(JSON.stringify({ error: "No file" }), { status: 400 });
//     }

//     if (!ALLOWED_MIME_TYPES.includes(file.type)) {
//       return new Response(
//         JSON.stringify({ error: "Unsupported file type" }),
//         { status: 415 }
//       );
//     }

//     const buffer = Buffer.from(await file.arrayBuffer());

//     // ⚠️ You can later move this to a permanent uploads folder
//     const uploadDir = path.join(process.cwd(), "uploads");
//     await fs.mkdir(uploadDir, { recursive: true });

//     const safeName = sanitizeFilename(file.name || "upload");
//     const filePath = path.join(uploadDir, `${Date.now()}_${safeName}`);
//     await fs.writeFile(filePath, buffer);

//     /* ---------- PDF DETECTION ---------- */
//     let pdfType: "digital" | "scanned" = "scanned";

//     if (file.type === "application/pdf") {
//   const formData2 = new FormData();
//   formData2.append(
//     "file",
//     new Blob([buffer], { type: "application/pdf" }),
//     file.name
//   );

//       const detectRes = await fetch(
//         `${HANDW_API_BASE}/api/detect-pdf-type`,
//         {
//           method: "POST",
//           headers: {
//             "x-api-key": HANDW_API_KEY,
//           },
//           body: formData2,
//         }
//       );

//       if (!detectRes.ok) {
//         throw new Error("PDF detection failed");
//       }

//       const { type } = await detectRes.json();
//       pdfType = type;
//     }



//     console.log("📄 PDF TYPE:", pdfType);

//     /* ---------- DIGITAL PDF ---------- */
//     if (pdfType === "digital") {
//       return new Response(
//         JSON.stringify({
//           mode: "digital",
//           filePath,
//         }),
//         { status: 200 }
//       );
//     }

//     /* ---------- SCANNED ---------- */
//     const jobId = crypto.randomUUID();

//     return new Response(
//       JSON.stringify({
//         mode: "scanned",
//         jobId,
//         filePath,
//       }),
//       { status: 200 }
//     );

//   } catch (err: any) {
//     console.error("🔥 upload error:", err);
//     return new Response(
//       JSON.stringify({ error: err.message }),
//       { status: 500 }
//     );
//   }
// }


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
