import React from "react";
import { requireAuth, logoutAction, getCurrentUser, switchOrgAction } from "@/lib/auth";

// Force dynamic rendering due to cookie/session usage
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure user is authenticated; also fetch full user for memberships display
  await requireAuth();
  const user = await getCurrentUser();

  // Basic org list for switcher (if backend provides memberships on /auth/me)
  const memberships =
    (user as unknown as { memberships?: Array<{ org_id: string; org_name: string; role: string }> })
      ?.memberships || [];

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold">CollabTask</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">
              {(user?.name || user?.email) ?? ""}
              {user?.org_id ? ` @ ${user.org_id}` : ""}
            </span>
            {memberships.length > 0 && (
              <details className="relative">
                <summary className="ml-2 cursor-pointer rounded-md border px-2 py-1 text-xs hover:bg-gray-100 list-none">
                  Switch org
                </summary>
                <div className="absolute z-10 mt-1 min-w-[220px] rounded-md border bg-white shadow">
                  <div className="max-h-64 overflow-auto p-1">
                    {memberships.map((m) => (
                      <form key={m.org_id} action={switchOrgAction}>
                        <input type="hidden" name="org_id" value={m.org_id} />
                        <button
                          type="submit"
                          className={[
                            "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100",
                            user?.org_id === m.org_id ? "font-semibold" : "",
                          ].join(" ")}
                        >
                          {m.org_name}{" "}
                          <span className="text-gray-500">({m.role})</span>
                          {user?.org_id === m.org_id ? (
                            <span className="ml-2 text-green-600">•</span>
                          ) : null}
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              </details>
            )}
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
