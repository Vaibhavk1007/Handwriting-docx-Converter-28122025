import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { orderId } = await req.json();

  if (!orderId) {
    return NextResponse.json(
      { error: "Missing orderId" },
      { status: 400 }
    );
  }

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString("base64");

  // Get access token
  const tokenRes = await fetch(
    "https://api-m.sandbox.paypal.com/v1/oauth2/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    }
  );

  const { access_token } = await tokenRes.json();

  // 🔥 CAPTURE (only after approval)
  const captureRes = await fetch(
    `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const result = await captureRes.json();

  if (!captureRes.ok) {
    console.error("❌ PayPal capture error:", result);
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json({ success: true, result });
}
