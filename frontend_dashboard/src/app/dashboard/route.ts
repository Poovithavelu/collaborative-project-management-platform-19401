import { NextResponse } from "next/server";

/**
 * PUBLIC_INTERFACE
 * This explicit route file ensures the dashboard segment is treated dynamically.
 * It responds to non-GET methods defensively and is not intended for use,
 * but helps Next Router classify the segment as dynamic.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  // Redirect to the dashboard page
  return NextResponse.redirect(new URL("/dashboard", "http://localhost"));
}

export async function POST() {
  return new Response("Method Not Allowed", { status: 405 });
}
