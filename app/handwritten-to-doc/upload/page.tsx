"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/components/header";
import Footer from "@/components/footer";
import UploadArea from "@/components/upload-area";
import { Info, Shield } from "lucide-react";
import { saveJob } from "@/lib/jobStore";
import { apiFetch } from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [strictMode, setStrictMode] = useState(true);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (file: File, strict: boolean) => {
    setSelectedFile(file);
    setStrictMode(strict);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const startTime = Date.now();

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/handwritten/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data?.error ||
            "Please upload PDF, JPG, PNG, or GIF files only."
        );
      }
      const data = await res.json();

      /* ---------- DIGITAL ---------- */
      if (data.mode === "digital") {
        saveJob({
          jobId: "digital-preview",
          createdAt: startTime,
          filePath: data.filePath,
          file: selectedFile,              // ✅ REQUIRED
          strict: strictMode,
          state: "free-ready",
          source: "digital-pdf",
        });

        setUploading(false);
        router.push("/handwritten-to-doc/free-preview");
        return;
      }

      /* ---------- SCANNED ---------- */
      saveJob({
        jobId: data.jobId,
        createdAt: startTime,
        filePath: data.filePath,
        strict: strictMode,
        state: "processing",
        source: "scanned",
      });

      setUploading(false);
      router.push(`/handwritten-to-doc/process?jobId=${data.jobId}`);

    } catch (err: any) {
      console.error(err);

      const msg =
        err?.message ||
        "Please upload PDF, JPG, PNG, or GIF files only.";

      alert(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <section className="mx-auto max-w-3xl px-4 py-12 space-y-6">
          <UploadArea
            onFileUpload={handleFileUpload}
            selectedFile={selectedFile}
            uploading={uploading}
            onConvert={handleConvert}
          />
          <InfoBlock />
        </section>
      </main>
      <Footer />
    </div>
  );
}

function InfoBlock() {
  return (
    <>
      <div className="flex gap-3 bg-muted rounded-lg p-4 border">
        <Info className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Preview before you commit. No credits deducted yet.
        </p>
      </div>

      <div className="flex gap-3 bg-muted/50 rounded-lg p-4 border">
        <Shield className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Files are processed securely and deleted automatically.
        </p>
      </div>
    </>
  );
}
