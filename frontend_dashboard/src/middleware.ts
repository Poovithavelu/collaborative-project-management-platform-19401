import type { NextRequest } from "next/server";

/**
 * PUBLIC_INTERFACE
 * A no-op middleware that ensures the app runs in Edge/middleware pipeline,
 * which implicitly opts routes into dynamic behavior and prevents full static optimization.
 * This can help avoid build stalls when auth cookies and runtime APIs are required.
 */
export function middleware(_req: NextRequest) {
  // no-op
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
