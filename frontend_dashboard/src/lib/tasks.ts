"use server";

/**
 * Task API helpers and server actions.
 *
 * PUBLIC_INTERFACE functions in this file:
 * - listTasksByProject
 * - createTaskAction
 * - updateTaskAction
 *
 * Endpoints used:
 * - GET /tasks?project_id=:id
 * - POST /tasks
 * - PUT /tasks/{task_id}
 */

import { revalidatePath } from "next/cache";
import { apiRequest } from "./api";

/** Backend Task shape from OpenAPI */
export type Task = {
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

export type TaskCreateInput = {
  project_id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  assignee_id?: string | null;
};

export type TaskUpdateInput = {
  title?: string | null;
  description?: string | null;
  status?: string | null;
  assignee_id?: string | null;
};

/**
 * PUBLIC_INTERFACE
 * listTasksByProject: fetch tasks filtered by project ID. Returns empty array on failure.
 */
export async function listTasksByProject(projectId: string): Promise<Task[]> {
  const res = await apiRequest<Task[]>(`/tasks?project_id=${encodeURIComponent(projectId)}`, {
    method: "GET",
  });
  if (!res.ok || !res.data) return [];
  return res.data;
}

/**
 * PUBLIC_INTERFACE
 * createTaskAction: Server action to create a task within a project.
 * Validates required fields, posts to /tasks, and revalidates the project detail route.
 * Returns { error?: string } for client to show errors if any.
 */
export async function createTaskAction(_: unknown, formData: FormData) {
  "use server";
  const project_id = String(formData.get("project_id") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const descriptionRaw = formData.get("description");
  const description =
    descriptionRaw === null || descriptionRaw === undefined ? null : String(descriptionRaw);
  const statusRaw = formData.get("status");
  const status = statusRaw === null || statusRaw === undefined ? "todo" : String(statusRaw).trim() || "todo";
  const assignee_id_raw = formData.get("assignee_id");
  const assignee_id =
    assignee_id_raw === null || assignee_id_raw === undefined || String(assignee_id_raw).trim() === ""
      ? null
      : String(assignee_id_raw).trim();

  if (!project_id) {
    return { error: "Missing project context." };
  }
  if (!title) {
    return { error: "Task title is required." };
  }

  const body: TaskCreateInput = { project_id, title, description, status, assignee_id };

  const res = await apiRequest<Task>("/tasks", { method: "POST", body });
  if (!res.ok) {
    return { error: res.error || "Failed to create task." };
  }

  // Revalidate the project detail page to show the new task.
  revalidatePath(`/dashboard/projects/${project_id}`);
}

/**
 * PUBLIC_INTERFACE
 * updateTaskAction: Server action to update an existing task by ID.
 * Accepts optional fields and revalidates the project detail page using provided project_id.
 * Returns { error?: string } for client display on failure.
 */
export async function updateTaskAction(_: unknown, formData: FormData) {
  "use server";
  const task_id = String(formData.get("task_id") || "").trim();
  const project_id = String(formData.get("project_id") || "").trim();
  const titleRaw = formData.get("title");
  const descriptionRaw = formData.get("description");
  const statusRaw = formData.get("status");
  const assigneeRaw = formData.get("assignee_id");

  if (!task_id) {
    return { error: "Missing task id." };
  }
  if (!project_id) {
    return { error: "Missing project context." };
  }

  const body: TaskUpdateInput = {
    title: titleRaw === null ? undefined : String(titleRaw),
    description: descriptionRaw === null ? undefined : String(descriptionRaw),
    status: statusRaw === null ? undefined : String(statusRaw),
    assignee_id:
      assigneeRaw === null
        ? undefined
        : String(assigneeRaw).trim() === ""
        ? null
        : String(assigneeRaw).trim(),
  };

  const res = await apiRequest<Task>(`/tasks/${encodeURIComponent(task_id)}`, {
    method: "PUT",
    body,
  });
  if (!res.ok) {
    return { error: res.error || "Failed to update task." };
  }

  revalidatePath(`/dashboard/projects/${project_id}`);
}
