"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Header from "@/components/header";
import Footer from "@/components/footer";
import ProcessingStatus from "@/components/processing-status";
import { getJob, updateJob } from "@/lib/jobStore";

const POLL_INTERVAL = 2000; // 2s
const MAX_POLLS = 60;       // ~2 minutes

export default function ProcessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const startedRef = useRef(false);

  useEffect(() => {
    if (!jobId) {
      router.replace("/handwritten-to-doc/upload");
      return;
    }

    if (startedRef.current) return;
    startedRef.current = true;

    const job = getJob();
    if (!job || job.jobId !== jobId) {
      router.replace("/handwritten-to-doc/upload");
      return;
    }

    const { filePath, strict } = job;

    async function enqueueAndPoll() {
      try {
        /* 1️⃣ ENQUEUE */
        const enqueueRes = await fetch("/api/handwritten/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId,
            filepath: filePath,
            strict,
          }),
        });

        if (!enqueueRes.ok) {
          throw new Error("Failed to enqueue job");
        }

        updateJob({ state: "processing" });

        /* 2️⃣ POLL RESULT */
        let polls = 0;

        const poll = async () => {
          polls++;

          try {
            const res = await fetch(
              `/api/handwritten/result/${jobId}`,
              { cache: "no-store" }
            );

            if (res.ok) {
              const data = await res.json();

              if (data?.html) {
                updateJob({
                  state: "ready",
                  html: data.html,
                });

                router.replace(
                  `/handwritten-to-doc/preview?jobId=${jobId}`
                );
                return;
              }
            }
          } catch (e) {
            console.warn("Polling failed, retrying…");
          }

          if (polls >= MAX_POLLS) {
            updateJob({ state: "error" });
            router.replace("/handwritten-to-doc/upload");
            return;
          }

          setTimeout(poll, POLL_INTERVAL);
        };

        poll();
      } catch (err) {
        console.error("❌ Processing error:", err);
        updateJob({ state: "error" });
        router.replace("/handwritten-to-doc/upload");
      }
    }

    enqueueAndPoll();
  }, [jobId, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center bg-muted/30">
        <ProcessingStatus state="processing" />
      </main>

      <Footer />
    </div>
  );
}
