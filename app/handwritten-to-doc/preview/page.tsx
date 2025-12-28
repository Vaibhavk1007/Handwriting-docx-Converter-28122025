"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";

import Header from "@/components/header";
import Footer from "@/components/footer";
import HtmlPreview from "@/components/HtmlPreview.client";
import { loadJob, updateJob } from "@/lib/jobStore";
import type { JobData } from "@/types/job";

export default function PreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [job, setJob] = useState<JobData | null>(null);
  const [documentHtml, setDocumentHtml] = useState<string | null>(null);
  const isPaid = job?.state === "paid";

  const [showPayConfirm, setShowPayConfirm] = useState(false);
  const [pendingType, setPendingType] = useState<"docx" | "pdf" | null>(null);
  const [state, setState] =
    useState<"preview" | "exporting" | "complete" | "error">("preview");

  const [paymentGateway, setPaymentGateway] =
    useState<"razorpay" | "paypal" | null>(null);
  const [razorpayOptions, setRazorpayOptions] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);

  /* ================= LOAD JOB (STRICT) ================= */
  useEffect(() => {
    if (!jobId) {
      router.replace("/handwritten-to-doc/upload");
      return;
    }

    const storedJob = loadJob();

    if (!storedJob || storedJob.jobId !== jobId) {
      router.replace("/handwritten-to-doc/upload");
      return;
    }

    // ✅ Allowed states
    if (!["ready", "paid"].includes(storedJob.state)) {
      router.replace("/handwritten-to-doc/upload");
      return;
    }

    // ✅ If HTML already exists → render immediately
    if (storedJob.html) {
      setJob(storedJob);
      setDocumentHtml(storedJob.html);
      return;
    }

    // 🔄 Otherwise fetch from backend
    (async () => {
      try {
        const html = await fetchResult(jobId);

        updateJob({ html });

        const fresh = loadJob();
        if (fresh?.html) {
          setJob(fresh);
          setDocumentHtml(fresh.html);
        }
      } catch (err) {
        console.error("❌ Failed to load result:", err);
        router.replace("/handwritten-to-doc/upload");
      }
    })();
  }, [jobId, router]);


  /* ================= PAYPAL RETURN ================= */
  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;

    async function capturePayPal() {
      try {
        const res = await fetch("/api/paypal/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: token }),
        });

        if (!res.ok) throw new Error(await res.text());

        updateJob({ state: "paid" });

        const freshJob = loadJob();
        if (freshJob?.html) {
          setJob(freshJob);
          setDocumentHtml(freshJob.html);
        }

        window.history.replaceState(
          {},
          "",
          `/handwritten-to-doc/preview?jobId=${jobId}`
        );
      } catch (err) {
        console.error("❌ PayPal capture failed:", err);
      }
    }

    capturePayPal();
  }, [jobId, searchParams]);

  /* ================= DOWNLOAD (READ-ONLY) ================= */
  const handleDownload = async (type: "docx" | "pdf") => {
    if (!documentHtml) return;

    // ✅ local UI state only
    setState("exporting");

    const endpoint =
      type === "pdf"
        ? "/api/handwritten/export/pdf"
        : "/api/handwritten/export";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: documentHtml,
          title: "Converted_Document",
        }),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download =
        type === "pdf"
          ? "Converted_Document.pdf"
          : "Converted_Document.docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setState("complete");
      updateJob({ state: "paid" });
    } catch (err) {
      console.error("❌ export failed:", err);
      setState("error");
      updateJob({ state: "error" });
    }
  };

  /* ================= PAYMENT ================= */
  const handlePaidDownload = async (type: "docx" | "pdf") => {
    if (!job) {
      router.replace("/handwritten-to-doc/upload");
      return;
    }

    if (isPaid) {
      handleDownload(type);
      return;
    }

    const res = await fetch("/api/checkout/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: job.jobId }),
    });

    if (!res.ok) {
      alert("Unable to start payment");
      return;
    }

    const data = await res.json();
    setPaymentGateway(data.gateway);
    setPendingType(type);
    setShowPayConfirm(true);

    if (data.gateway === "paypal") {
      (window as any).__PAYPAL_URL__ = data.approveUrl;
      return;
    }

    if (data.gateway === "razorpay") {
      setRazorpayOptions({
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        order_id: data.order.id,
        name: "Handwritten → DOC",
        description: "One-time document conversion",
        handler: () => {
          updateJob({ state: "paid" });

          const freshJob = loadJob();
          if (freshJob?.html) {
            setJob(freshJob);
            setDocumentHtml(freshJob.html);
          }

          setShowPayConfirm(false);
          setPendingType(null);
        },
      });
    }
  };

  async function fetchResult(jobId: string) {
    const res = await fetch(`/api/handwritten/result/${jobId}`);

    if (!res.ok) {
      throw new Error("Result not ready");
    }

    const data = await res.json();

    if (!data?.html) {
      throw new Error("Invalid result");
    }

    return data.html as string;
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading preview…</p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 bg-slate-100">
          <section className="mx-auto max-w-7xl px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full">

              {/* LEFT */}
              <div className="lg:col-span-8 flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-2">
                  <span className="text-sm font-semibold">
                    Handwritten Document
                  </span>
                  <span className="text-xs text-green-700">✓ Ready</span>
                </div>

                <div className="flex-1 rounded-xl border bg-slate-50 p-3 overflow-hidden">
                  {documentHtml && (
                    <HtmlPreview
                      key={`${job.state}-${job.jobId}`}
                      htmlFragment={documentHtml}
                      height="100%"
                      showWatermark={!isPaid}
                    />
                  )}
                </div>
              </div>

              {/* RIGHT */}
              <div className="lg:col-span-4">
                <div className="sticky top-6 space-y-6">

                  {/* STATUS */}
                  <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Document ready
                        </p>
                        <p className="text-xs text-slate-500">
                          Processing completed successfully
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PRIMARY ACTION */}
                  <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <button
                      onClick={() => {
                        if (isPaid) {
                          handleDownload("docx");
                        } else {
                          handlePaidDownload("docx");
                        }
                      }}
                      className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
                    >
                      {isPaid ? "Download DOCX" : "Upgrade & Download"}
                    </button>

                    <p className="mt-3 text-center text-xs text-slate-500">
                      One-time payment • No subscription
                    </p>
                  </div>

                  {/* BENEFITS */}
                  {!isPaid && (
                    <div className="rounded-xl border bg-slate-50 p-5">
                      <h4 className="text-xs font-semibold text-slate-700 mb-3">
                        What you get
                      </h4>
                      <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span> Editable Word document
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span> No watermark
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span> Instant download
                        </li>
                      </ul>
                    </div>
                  )}

                  {/* DOCUMENT INFO */}
                  <div className="rounded-xl border bg-white p-5">
                    <h4 className="text-xs font-semibold text-slate-700 mb-3">
                      Document details
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-500">
                      <li>Words: {job.wordCount ?? "—"}</li>
                      <li>Pages: {job.wordCount ? Math.max(1, Math.ceil(job.wordCount / 450)) : "—"}</li>
                      <li>
                        Processing time:{" "}
                        {job.processingTime ? `~${job.processingTime}s` : "—"}
                      </li>
                    </ul>
                  </div>

                  {/* SECONDARY */}
                  <div className="rounded-xl border bg-white p-5">
                    <button
                      onClick={() => router.push("/handwritten-to-doc/upload")}
                      className="w-full rounded-lg border px-4 py-2.5 text-sm hover:bg-slate-50 transition"
                    >
                      Process another document
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </section>

          {showPayConfirm && pendingType && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-200">

                {/* Header */}
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Download Document
                  </h3>
                  <p className="text-sm text-slate-500">
                    One-time payment • Instant access
                  </p>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">

                  {/* Price */}
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-600">
                      Total payable
                    </span>
                    <span className="text-2xl font-bold text-slate-900">
                      {paymentGateway === "paypal"
                        ? "$5"
                        : paymentGateway === "razorpay"
                        ? "₹399"
                        : "—"}
                    </span>
                  </div>

                  {/* Benefits */}
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600 font-semibold">✓</span>
                      Editable DOCX file
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600 font-semibold">✓</span>
                      No watermark
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600 font-semibold">✓</span>
                      Instant download
                    </li>
                  </ul>

                  {/* Trust */}
                 <p className="text-xs text-slate-500">
                  Secure payment powered by{" "}
                  {paymentGateway === "paypal" ? "PayPal" : "Razorpay"}
                </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t space-y-2">

                  {/* Primary CTA */}
                 {/* <button
                    onClick={() => {
                      setShowPayConfirm(false);

                      if (paymentGateway === "paypal") {
                        window.location.href = (window as any).__PAYPAL_URL__;
                        return;
                      }

                      if (paymentGateway === "razorpay" && razorpayOptions) {
                        const rzp = new window.Razorpay(razorpayOptions);
                        rzp.open();   // ✅ OPEN HERE
                        return;
                      }
                    }}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
                  >
                    Pay {paymentGateway === "paypal"
                      ? "$5"
                      : paymentGateway === "razorpay"
                      ? "₹399"
                      : "—"} & Download
                  </button> */}

                  <button
                    disabled={isPaying}
                    onClick={() => {
                      if (isPaying) return;

                      setIsPaying(true);
                      setShowPayConfirm(false);

                      if (paymentGateway === "paypal") {
                        window.location.href = (window as any).__PAYPAL_URL__;
                        return;
                      }

                      if (paymentGateway === "razorpay" && razorpayOptions) {
                        const rzp = new window.Razorpay({
                          ...razorpayOptions,
                          handler: (response: any) => {
                            setIsPaying(false);
                            razorpayOptions.handler(response);
                          },
                          modal: {
                            ondismiss: () => {
                              setIsPaying(false);
                            },
                          },
                        });

                        rzp.open();
                        return;
                      }
                    }}
                    className={`w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition
                      ${isPaying
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"}
                    `}
                  >
                    {isPaying ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                        Processing…
                      </span>
                    ) : (
                      <>
                        Pay{" "}
                        {paymentGateway === "paypal"
                          ? "$5"
                          : paymentGateway === "razorpay"
                          ? "₹399"
                          : "—"}{" "}
                        & Download
                      </>
                    )}
                  </button>


                  {/* Cancel */}
                  {/* <button
                    onClick={() => {
                      setShowPayConfirm(false);
                      setPendingType(null);
                    }}
                    className="w-full text-sm text-slate-500 hover:underline"
                  >
                    Cancel
                  </button> */}
                  <button
                    onClick={() => {
                      setIsPaying(false);
                      setShowPayConfirm(false);
                      setPendingType(null);
                    }}
                    className="w-full text-sm text-slate-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
