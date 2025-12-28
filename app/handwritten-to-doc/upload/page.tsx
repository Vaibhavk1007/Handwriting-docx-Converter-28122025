"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/components/header";
import Footer from "@/components/footer";
import UploadArea from "@/components/upload-area";
import { Info, Shield } from "lucide-react";
import { saveJob } from "@/lib/jobStore";

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

      if (!res.ok) throw new Error("Upload failed");

      const { jobId, filePath } = await res.json();

      saveJob({
        jobId,
        createdAt: startTime,
        filePath,
        strict: strictMode,
        state: "processing",
      });

      router.push(`/handwritten-to-doc/process?jobId=${jobId}`);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <section className="mx-auto max-w-3xl px-4 py-12 space-y-6">
          <UploadArea onFileUpload={handleFileUpload} />

          {selectedFile && (
            <div className="rounded-xl border bg-white p-4 text-center space-y-3">
              <p className="text-sm font-medium">{selectedFile.name}</p>

              <button
                onClick={handleConvert}
                disabled={uploading}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Convert to Word"}
              </button>
            </div>
          )}

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
