"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadJob } from "@/lib/jobStore";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function FreePreviewPage() {
  const router = useRouter();
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    const stored = loadJob();

    if (!stored || stored.source !== "digital-pdf") {
      router.replace("/handwritten-to-doc/upload");
      return;
    }

    setJob(stored);
  }, [router]);

  if (!job) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7ff]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border p-8 text-center space-y-6">
          <Sparkles className="h-10 w-10 mx-auto text-primary" />

          <h1 className="text-2xl font-semibold">
            Your document is ready 🎉
          </h1>

          <p className="text-muted-foreground">
            This PDF already contained selectable text.
          </p>

          <Button
            size="lg"
            className="w-full"
            onClick={async () => {
              if (!job?.file) {
                alert("Original file missing. Please re-upload.");
                return;
              }

              const formData = new FormData();
              formData.append("file", job.file); // ✅ MUST be named "file"

              const res = await fetch("/api/export-digital-docx", {
                method: "POST",
                // headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  filePath: job.filePath,
                }),
              });

              if (!res.ok) {
                console.error(await res.text());
                alert("Export failed");
                return;
              }

              const blob = await res.blob();
              const url = URL.createObjectURL(blob);

              const a = document.createElement("a");
              a.href = url;
              a.download = "Converted_Document.docx";
              a.click();

              URL.revokeObjectURL(url);
            }}

          >
            Download Word file
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
