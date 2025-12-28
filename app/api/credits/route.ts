import { NextResponse } from "next/server"

// Mock API endpoint for getting user credits
// In production, this would check authentication and fetch from database
export async function GET() {
  // Mock: return 0 credits for first-time users
  return NextResponse.json({ credits: 0 })
}
