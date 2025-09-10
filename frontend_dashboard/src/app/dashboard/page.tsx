import React from "react";
import { getCurrentUser } from "@/lib/auth";

// Tell Next.js this page depends on dynamic data (cookies) and must be rendered dynamically
export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const user = await getCurrentUser();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {user ? (
        <div className="rounded-lg border bg-white p-4">
          <p className="text-gray-700">
            Welcome, <span className="font-medium">{user.name || user.email}</span>.
          </p>
          <p className="text-sm text-gray-500">
            {user.org_id ? `Organization: ${user.org_id}` : "No organization set."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white p-4">
          <p className="text-gray-700">
            You are not authenticated. You should have been redirected to login.
          </p>
        </div>
      )}
    </section>
  );
}
