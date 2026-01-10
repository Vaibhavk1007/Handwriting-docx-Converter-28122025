// app/api/export-docx/route.ts
export const runtime = "nodejs";

// Helper: make sure header values (like filename) don't contain
// characters that break ByteString (e.g. en dash “–”, smart quotes, ₹, etc.)
function sanitizeForHeader(value: string): string {
  if (!value) return "";

  return value
    .normalize("NFKD")
    // Keep only basic printable ASCII (space to ~); replace others with "_"
    .replace(/[^\x20-\x7E]/g, "_");
}

export async function POST(req: Request): Promise<Response> {
  const {
    contentJson,
    fileName,
    templateSlug,
    designKey,
    brand,
    signatory,
  }: {
    contentJson: any;
    fileName?: string;
    templateSlug?: string;
    designKey?: string;
    brand?: any;
    signatory?: any;
  } = await req.json();

  const flaskUrl =
    process.env.FLASK_DOCX_URL ?? "http://localhost:8001/generate-docx";

  let res: Response;

  try {
    res = await fetch(flaskUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentJson,
        fileName,
        templateSlug,
        designKey,
        brand,
        signatory,
        baseTemplate: "default",
      }),
    });
  } catch (err) {
    console.error("DOCX service network error:", err);
    return new Response(
      JSON.stringify({
        error: "Flask export failed (network error)",
        details: String(err),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("DOCX service error:", res.status, text);
    return new Response(
      JSON.stringify({
        error: "Flask export failed",
        status: res.status,
        details: text,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const arrayBuffer = await res.arrayBuffer();

  // 🔧 Sanitize filename for headers
  let safeFileName = sanitizeForHeader(fileName || "document");

  if (!safeFileName.toLowerCase().endsWith(".docx")) {
    safeFileName += ".docx";
  }

  return new Response(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${safeFileName}"`,
    },
  });
}
