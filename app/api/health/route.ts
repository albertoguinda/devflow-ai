import { NextResponse } from "next/server";

/**
 * Health check endpoint for monitoring and post-deploy verification.
 * Returns 200 OK with version and timestamp.
 */
export function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
