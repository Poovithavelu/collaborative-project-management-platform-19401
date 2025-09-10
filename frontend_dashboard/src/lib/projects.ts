"use server";

/**
 * Project API helper and server actions for the dashboard.
 *
 * PUBLIC_INTERFACE functions in this file:
 * - listProjects
 * - createProjectAction
 *
 * These functions call the backend endpoints:
 *  - GET /projects
 *  - POST /projects
 */

import { revalidatePath } from "next/cache";
import { apiRequest } from "./api";

/** Backend Project shape from OpenAPI */
export type Project = {
  id: string;
  org_id: string;
  name: string;
  description?: string | null;
  created_by?: string | null;
  created_at: string;
};

/**
 * PUBLIC_INTERFACE
 * listProjects: Fetch all projects scoped to the user's active organization.
 * Returns an empty array on error/unauthenticated state.
 */
export async function listProjects(): Promise<Project[]> {
  const res = await apiRequest<Project[]>("/projects", { method: "GET" });
  if (!res.ok || !res.data) return [];
  return res.data;
}

/**
 * PUBLIC_INTERFACE
 * createProjectAction: Server action to create a new project using POST /projects.
 * On success, revalidates /dashboard so the new project appears in the list.
 * Returns { error?: string } on failure for client display.
 */
export async function createProjectAction(_: unknown, formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const descriptionRaw = formData.get("description");
  const description =
    descriptionRaw === null || descriptionRaw === undefined
      ? null
      : String(descriptionRaw);

  if (!name) {
    return { error: "Project name is required." };
  }

  const res = await apiRequest<Project>("/projects", {
    method: "POST",
    body: { name, description },
  });

  if (!res.ok) {
    return { error: res.error || "Failed to create project." };
  }

  // Ensure the dashboard list reflects the new project
  revalidatePath("/dashboard");
}
