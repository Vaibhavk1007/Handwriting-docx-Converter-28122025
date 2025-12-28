import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()

  // TODO: verify webhook signature (later)
  console.log("PayPal webhook received:", body.event_type)

  return NextResponse.json({ received: true })
}