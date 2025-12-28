import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PYTHON_EXPORT_URL =
  process.env.PY_EXPORT_URL || "http://localhost:8001/export";

const MAX_HTML_SIZE = 300_000; // 300 KB
const EXPORT_TIMEOUT_MS = 60_000;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { html, title } = body as {
      html?: unknown;
      title?: string;
    };

    /* ================= VALIDATION ================= */

    if (typeof html !== "string" || html.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty HTML" },
        { status: 400 }
      );
    }

    if (html.length > MAX_HTML_SIZE) {
      return NextResponse.json(
        { error: "HTML too large to export" },
        { status: 413 }
      );
    }

    const safeTitle =
      typeof title === "string" && title.trim()
        ? title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100)
        : "document";

    /* ================= PYTHON CALL ================= */

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      EXPORT_TIMEOUT_MS
    );

    let response: Response;

    try {
      response = await fetch(PYTHON_EXPORT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html,
          title: safeTitle,
        }),
        signal: controller.signal,
      });
    } catch (err: any) {
      if (err.name === "AbortError") {
        return NextResponse.json(
          { error: "Export timed out" },
          { status: 504 }
        );
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    /* ================= RESPONSE VALIDATION ================= */

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Python export error:", text);
      return new NextResponse(text, { status: response.status });
    }

    const contentType =
      response.headers.get("Content-Type") || "";

    if (
      !contentType.includes(
        "application/vnd.openxmlformats-officedocument"
      ) &&
      !contentType.includes("application/pdf")
    ) {
      const text = await response.text();
      console.error(
        "❌ Invalid export content-type:",
        contentType
      );
      return NextResponse.json(
        { error: "Invalid export response" },
        { status: 500 }
      );
    }

    /* ================= STREAM BINARY ================= */

    const arrayBuffer = await response.arrayBuffer();

    const headers = new Headers();
    headers.set("Content-Type", contentType);

    const disposition =
      response.headers.get("Content-Disposition");

    if (disposition) {
      headers.set("Content-Disposition", disposition);
    } else {
      headers.set(
        "Content-Disposition",
        `attachment; filename="${safeTitle}.docx"`
      );
    }

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error("🔥 Export route fatal error:", err);
    return NextResponse.json(
      { error: err?.message || "Export failed" },
      { status: 500 }
    );
  }
}
