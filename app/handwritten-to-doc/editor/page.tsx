"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { FormyxaToolbar } from "@/components/editor/FormyxaToolbar";
import { FormyxaSidebar } from "@/components/editor/FormyxaSidebar";
import type { StructurePage } from "@/components/editor/FormyxaSidebar";

import { JsonEditor } from "@/components/editor/JsonEditor";
import { loadJob, updateJob } from "@/lib/jobStore";
import type { JobData } from "@/types/job";

import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

function extractHeadings(doc: any): StructurePage[] {
  const headings: Array<{ id: string; name: string }> = [];

  const walk = (n: any) => {
    if (!n) return;
    if (Array.isArray(n)) return n.forEach(walk);

    if (n.type === "heading") {
      const text =
        (n.content || [])
          .map((c: any) => (c.type === "text" ? c.text : ""))
          .join("")
          .trim() || "Heading";

      headings.push({
        id: `h-${headings.length + 1}`,
        name: text,
      });
    }

    if (Array.isArray(n.content)) n.content.forEach(walk);
  };

  walk(doc?.content || []);

  return [
    {
      id: "page-1",
      name: "Page 1",
      sections:
        headings.length > 0
          ? headings.map((h) => ({
              id: h.id,
              name: h.name,
              onClick: () => {
                const el = document.getElementById("formyxa-doc-top");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              },
            }))
          : [
              {
                id: "doc",
                name: "Document",
                onClick: () => {
                  const el = document.getElementById("formyxa-doc-top");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                },
              },
            ],
    },
  ];
}

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [job, setJob] = useState<JobData | null>(null);
  const [editorRef, setEditorRef] = useState<any>(null);

  const [fileName, setFileName] = useState("Converted_Document.docx");
  const [saving, setSaving] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  /* ================= LOAD JOB ================= */
  useEffect(() => {
    if (!jobId) {
      router.replace("/handwritten-to-doc/upload");
      return;
    }

    const stored = loadJob();

    if (!stored || stored.jobId !== jobId) {
      router.replace("/handwritten-to-doc/upload");
      return;
    }

    if (stored.state !== "paid") {
      router.replace(`/handwritten-to-doc/preview?jobId=${jobId}`);
      return;
    }

    if (!stored.contentJson) {
      router.replace(`/handwritten-to-doc/preview?jobId=${jobId}`);
      return;
    }

    setJob(stored);
  }, [jobId, router]);

  const pages = useMemo(
    () => (job ? extractHeadings(job.contentJson) : []),
    [job]
  );

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading editor…</p>
      </div>
    );
  }

  /* ================= ACTIONS ================= */

//   async function handleSave() {
//     try {
//       setSaving(true);
//       setStatusText(null);
//       updateJob({ contentJson: job.contentJson });
//       setStatusText("Saved");
//     } finally {
//       setSaving(false);
//     }
//   }

  async function handleExport() {
    try {
        setSaving(true);
        setStatusText(null);

        if (!job?.contentJson) {
        throw new Error("No document content");
        }

        const res = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            fileName,                 // shown to user
            contentJson: job.contentJson, // ✅ TipTap JSON (NOT HTML)
            templateSlug: "default",  // or whatever you use
            designKey: undefined,     // optional (pass if you support designs)
            brand: null,              // optional
            signatory: null,          // optional
        }),
        });

        if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Export failed");
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName.toLowerCase().endsWith(".docx")
        ? fileName
        : `${fileName}.docx`;

        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        setStatusText("Downloaded");
    } catch (err) {
        console.error(err);
        setStatusText("Export failed");
    } finally {
        setSaving(false);
    }
    }


  return (
    <div className="h-screen flex flex-col bg-[#f5f7ff] text-slate-900">
      {/* TOP TOOLBAR */}
      <div
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <FormyxaToolbar
          documentName={fileName}
          onDocumentNameChange={setFileName}
          editor={editorRef}
          saving={saving}
          statusText={statusText}
          onExport={handleExport}
          zoom={zoom}
          onZoomChange={setZoom}
        />
      </div>

      <div className="flex flex-1">
        {/* SIDEBAR */}
        <div className="bg-[#fafafa] border-r border-[#f1f1f1]">
          <FormyxaSidebar
            collapsed={false}
            onCollapse={() => {}}
            activeTab="structure"
            onTabChange={() => {}}
            pages={pages}
            enabledTabs={["brand"]}
          />
        </div>

        {/* EDITOR */}
        <div className="flex-1 overflow-y-auto flex justify-center">
          <div
            className="editor-page w-full"
            style={{
              maxWidth: 780,
              padding: "64px 48px",
              left: "-24px", // 👈 optical centering
            }}
          >
            <div
              className="page bg-white"
              style={{
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                borderRadius: 6,
              }}
            >
              <JsonEditor
                chrome="canvas"
                zoom={zoom}
                onZoomChange={setZoom}
                onEditorReady={setEditorRef}
                initialDoc={job.contentJson}
                fileName={fileName}
                onFileNameChange={setFileName}
                onDocChange={(doc) => {
                  updateJob({ contentJson: doc });
                  setJob((j) => (j ? { ...j, contentJson: doc } : j));
                }}
              />
            </div>
        </div>
      </div>
      </div>
    </div>
  );
}
