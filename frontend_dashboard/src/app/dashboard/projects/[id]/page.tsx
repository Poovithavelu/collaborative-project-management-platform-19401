import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { listTasksByProject } from "@/lib/tasks";
import ClientTasksSectionServer from "./tasks/ClientTasksSectionServer";
import { isApiDisabled } from "@/lib/runtime";

// Page depends on cookies/backend => force dynamic
export const dynamic = "force-dynamic";

type Project = {
  id: string;
  org_id: string;
  name: string;
  description?: string | null;
  created_by?: string | null;
  created_at: string;
};

/**
 * PUBLIC_INTERFACE
 * Server-side function to fetch a single project for display context by reusing /projects (no direct GET /projects/{id} in spec).
 * Falls back to null if not found or request fails.
 */
async function getProjectById(projectId: string): Promise<Project | null> {
  const res = await apiRequest<Project[]>("/projects", { method: "GET" });
  if (!res.ok || !res.data) return null;
  const match = res.data.find((p) => p.id === projectId) || null;
  return match;
}

/**
 * PUBLIC_INTERFACE
 * Project Detail Page
 * - Verifies authentication via requireAuth (server-side redirect to /login if unauthenticated)
 * - Loads project context (name/description) and tasks via backend API
 * - Renders navigation to go back to dashboard
 * - Lists tasks with basic metadata and provides Create/Edit modal interactions
 */
export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  // If API disabled (build/CI), show a minimal placeholder to avoid network calls
  if (await isApiDisabled()) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-semibold text-black">Project</h1>
        </div>
        <p className="text-gray-700">Build preview. Data loading is disabled.</p>
      </section>
    );
  }

  // Ensure user is authenticated
  await requireAuth();

  const projectId = params.id;
  if (!projectId) {
    notFound();
  }

  // Fetch project context + tasks in parallel
  const [project, tasks] = await Promise.all([
    getProjectById(projectId),
    listTasksByProject(projectId),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-semibold text-black">{project.name}</h1>
        </div>
        <span className="shrink-0 rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
          Created {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>

      {project.description ? (
        <p className="text-gray-700">{project.description}</p>
      ) : (
        <p className="text-gray-400 italic">No project description provided.</p>
      )}

      <ClientTasksSectionServer initialTasks={tasks} projectId={projectId} />
    </section>
  );
}
