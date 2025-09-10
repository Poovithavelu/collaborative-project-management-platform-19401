import React from "react";
import { requireAuth, getCurrentUser } from "@/lib/auth";
import { listProjects } from "@/lib/projects";
import ProjectsListServer from "./ProjectsListServer";
import { isApiDisabled } from "@/lib/runtime";

// Mark page as dynamic: it depends on cookies and runtime backend responses.
export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  // If API disabled (build/CI), render a minimal placeholder without calling backend
  if (await isApiDisabled()) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-gray-700">Build preview. Data loading is disabled.</p>
        </div>
      </section>
    );
  }

  // Ensure authenticated; will redirect server-side if not.
  await requireAuth();

  const user = await getCurrentUser();
  const projects = await listProjects();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        {/* Placeholder for future filters or org switcher */}
      </div>

      {user ? (
        <div className="rounded-lg border bg-white p-4">
          <p className="text-gray-700">
            Welcome, <span className="font-medium">{user.name || user.email}</span>.
          </p>
          <p className="text-sm text-gray-500">
            {user.org_id ? `Organization: ${user.org_id}` : "No organization set."}
          </p>
        </div>
      ) : null}

      <ProjectsListServer initialProjects={projects} />
    </section>
  );
}
