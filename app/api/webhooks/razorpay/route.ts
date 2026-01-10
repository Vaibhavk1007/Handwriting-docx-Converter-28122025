import crypto from "crypto";
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { updateJob } from "@/lib/jobStore-server"; // ✅ server store

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPECTED_AMOUNT_INR = 5900; // ₹399 in paise
console.log("📥 Razorpay webhook hit");
console.log("🕒 Time:", new Date().toISOString());
export async function POST(req: Request) {
  /* ================= RAW BODY ================= */

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  console.log("📦 Raw body length:", rawBody.length);
  console.log("🔐 Signature present:", Boolean(signature));
  if (!signature) {
    return NextResponse.json(
      { error: "Missing Razorpay signature" },
      { status: 400 }
    );
  }

  /* ================= SIGNATURE VERIFY ================= */

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  console.log("🔑 Expected signature:", expected.slice(0, 8) + "...");
  console.log("🔑 Received signature:", signature?.slice(0, 8) + "...");  

  if (expected !== signature) {
    console.error("❌ Invalid Razorpay webhook signature");
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  /* ================= PARSE EVENT ================= */

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  console.log("🔔 Razorpay event:", event.event);

  /* ================= EVENT FILTER ================= */

  if (event.event !== "payment.captured") {
    // acknowledge but ignore other events
    return NextResponse.json({ ignored: true });
  }

  const payment = event.payload?.payment?.entity;

  if (!payment) {
    return NextResponse.json(
      { error: "Missing payment entity" },
      { status: 400 }
    );
  }

  /* ================= IDEMPOTENCY (REDIS) ================= */

  const paymentId = payment.id;
  const redisKey = `razorpay:payment:${paymentId}`;
  
 console.log("🧠 Redis idempotency key:", redisKey);

  const acquired = await redis.set(redisKey, "1", {
    nx: true,                 // only set if not exists
    ex: 60 * 60 * 24 * 7,     // 7 days TTL
  });

  if (!acquired) {
    console.log("⚠️ Duplicate Razorpay webhook ignored:", paymentId);
    return NextResponse.json({ ignored: true });
  }

  console.log("🔒 Redis lock acquired:", acquired);

  /* ================= VALIDATE PAYMENT ================= */

  if (payment.amount !== EXPECTED_AMOUNT_INR) {
    console.error("❌ Amount mismatch:", payment.amount);
    return NextResponse.json(
      { error: "Invalid payment amount" },
      { status: 400 }
    );
  }

  if (payment.currency !== "INR") {
    return NextResponse.json(
      { error: "Invalid currency" },
      { status: 400 }
    );
  }

  /* ================= EXTRACT JOB ID ================= */

  const jobId =
    payment.notes?.jobId ||
    payment.order_id?.replace("job_", "");

  if (!jobId) {
    console.error("❌ Missing jobId in payment");
    return NextResponse.json(
      { error: "Missing jobId" },
      { status: 400 }
    );
  }

  /* ================= UNLOCK JOB (REAL STATE CHANGE) ================= */

  console.log("✅ Payment verified for job:", jobId);
  console.log("💰 Razorpay payment id:", paymentId);

  // 🔓 SERVER-SIDE SOURCE OF TRUTH
  await updateJob(jobId, { state: "paid" });

  console.log(`🎉 Job ${jobId} marked as PAID`);

  return NextResponse.json({ received: true });
}
