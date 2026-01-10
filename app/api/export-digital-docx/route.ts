// export const runtime = "nodejs";

// import fs from "fs/promises";
// import { NextResponse } from "next/server";
// import { Document, Packer, Paragraph } from "docx";
// import { PDFParse } from "pdf-parse";

// export async function POST(req: Request) {
//   try {
//     const { filePath, fileName } = await req.json();

//     if (!filePath) {
//       return NextResponse.json(
//         { error: "filePath is required" },
//         { status: 400 }
//       );
//     }

//     // 1️⃣ Read PDF
//     const buffer = await fs.readFile(filePath);

//     // 2️⃣ Parse digital PDF (v2 API)
//     const parser = new PDFParse({ data: buffer });
//     const result = await parser.getText();
//     await parser.destroy();

//     const text = result.text?.trim();

//     if (!text) {
//       return NextResponse.json(
//         { error: "No selectable text found" },
//         { status: 400 }
//       );
//     }

//     // 3️⃣ Build DOCX
//     const paragraphs = text
//       .split(/\n{2,}/g)
//       .map((block) => new Paragraph({ text: block.trim() }));

//     const doc = new Document({
//       sections: [{ children: paragraphs }],
//     });

//     const docxBuffer = await Packer.toBuffer(doc);

//     const safeName = (fileName || "Converted_Document")
//       .replace(/[^\x20-\x7E]/g, "_")
//       .replace(/\.docx$/i, "");

//     return new Response(docxBuffer, {
//       status: 200,
//       headers: {
//         "Content-Type":
//           "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//         "Content-Disposition": `attachment; filename="${safeName}.docx"`,
//       },
//     });
//   } catch (err) {
//     console.error("❌ Digital PDF export failed:", err);
//     return NextResponse.json(
//       { error: "Digital PDF → DOCX failed" },
//       { status: 500 }
//     );
//   }
// }



import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HANDW_API_BASE = process.env.HANDW_API_BASE!;
const HANDW_API_KEY = process.env.HANDW_API_KEY!;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(
      `${HANDW_API_BASE}/api/export-digital-docx`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": HANDW_API_KEY,
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Export failed", details: text },
        { status: res.status }
      );
    }

    const buffer = await res.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition":
          'attachment; filename="Converted_Document.docx"',
      },
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
