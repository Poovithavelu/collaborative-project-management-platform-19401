import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { requireAuth } from "@/lib/auth";

// Page depends on cookies/backend => force dynamic
export const dynamic = "force-dynamic";

type Task = {
  id: string;
  org_id: string;
  project_id?: string | null;
  title: string;
  description?: string | null;
  status: string;
  assignee_id?: string | null;
  created_by?: string | null;
  created_at: string;
};

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
 * Server-side function to fetch tasks for a project.
 * Queries GET /tasks?project_id=<id> using the shared apiRequest and returns [] on failure.
 */
async function listTasksByProject(projectId: string): Promise<Task[]> {
  const res = await apiRequest<Task[]>(`/tasks?project_id=${encodeURIComponent(projectId)}`, { method: "GET" });
  if (!res.ok || !res.data) return [];
  return res.data;
}

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
 * - Lists tasks with basic metadata
 */
export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
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

      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Tasks</h2>
          {/* Placeholder: In future, add "New Task" action/modal */}
          <span className="text-sm text-gray-500">{tasks.length} task{tasks.length === 1 ? "" : "s"}</span>
        </div>

        {tasks.length === 0 ? (
          <div className="rounded-lg border bg-white p-4 text-gray-700">
            No tasks yet for this project.
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="rounded-lg border bg-white p-4 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-black truncate">{t.title}</span>
                      <span className="ml-2 shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {t.status || "todo"}
                      </span>
                    </div>
                    {t.description ? (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-3 break-words">
                        {t.description}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-400 italic">No description</p>
                    )}
                  </div>
                  <span className="ml-3 shrink-0 rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-500">
                    {new Date(t.created_at).toLocaleDateString()}
                  </span>
                </div>
                {t.assignee_id && (
                  <div className="mt-2 text-xs text-gray-500">Assignee: {t.assignee_id}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
