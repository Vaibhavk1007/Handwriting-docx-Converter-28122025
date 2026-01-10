"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Header from "@/components/header";
import Footer from "@/components/footer";
import ProcessingStatus from "@/components/processing-status";
import { getJob, updateJob } from "@/lib/jobStore";

type JobState = "queued" | "processing" | "ready" | "error";

export default function ProcessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const startedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ React-safe UI state
  const [jobState, setJobState] = useState<JobState>("processing");

  useEffect(() => {
    if (!jobId) {
      router.replace("/handwritten-to-doc/upload");
      return;
    }

    const job = getJob();
    if (!job || job.jobId !== jobId || !job.filePath) {
      router.replace("/handwritten-to-doc/upload");
      return;
    }

    // 🔒 Start OCR only once
    if (!startedRef.current) {
      startedRef.current = true;

      (async () => {
        const startRes = await fetch("/api/handwritten/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId,
            filePath: job.filePath,
          }),
        });

        if (!startRes.ok) {
          console.error("❌ Failed to start OCR:", await startRes.text());
          updateJob({ state: "error" });
          setJobState("error");
          return;
        }

        updateJob({ state: "processing" });
        setJobState("processing");
      })();
    }

    // 🔁 POLLING (fixed)
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/job-status?jobId=${jobId}`);
        if (!res.ok) return;

        const data = await res.json();

        updateJob(data);
        setJobState(data.state);

        if (data.state === "ready" && data.contentJson) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          updateJob({
            state: "ready",
            contentJson: data.contentJson,
          });

          router.replace(`/handwritten-to-doc/preview?jobId=${jobId}`);
        }

        if (data.state === "error") {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          router.replace("/handwritten-to-doc/upload");
        }
      } catch (err) {
        console.error("❌ Polling failed:", err);
      }
    }, 2000);

    // 🧹 CLEANUP (critical)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [jobId, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center bg-muted/30">
        <ProcessingStatus state={jobState} />
      </main>

      <Footer />
    </div>
  );
}
