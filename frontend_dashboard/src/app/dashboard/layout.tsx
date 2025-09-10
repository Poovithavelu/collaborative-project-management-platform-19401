import React from "react";
import { requireAuth, logoutAction } from "@/lib/auth";

// Layout depends on auth cookies and must be dynamic
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold">CollabTask</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">
              {user.name || user.email}
              {user.org_id ? ` @ ${user.org_id}` : ""}
            </span>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100"
            >
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
