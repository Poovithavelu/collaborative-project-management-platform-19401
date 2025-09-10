"use server";

/**
 * Comments API helpers and server actions.
 *
 * PUBLIC_INTERFACE functions in this file:
 * - listCommentsByTask
 * - createCommentAction
 *
 * Endpoints used:
 * - GET /comments?task_id=:id
 * - POST /comments
 */

import { revalidatePath } from "next/cache";
import { apiRequest } from "./api";

/** Backend Comment shape from OpenAPI */
export type Comment = {
  id: string;
  org_id: string;
  task_id: string;
  author_id?: string | null;
  content: string;
  created_at: string;
};

export type CommentCreateInput = {
  task_id: string;
  content: string;
};

/**
 * PUBLIC_INTERFACE
 * listCommentsByTask: fetch comments for a given task ID. Returns empty array on failure.
 */
export async function listCommentsByTask(taskId: string): Promise<Comment[]> {
  const res = await apiRequest<Comment[]>(
    `/comments?task_id=${encodeURIComponent(taskId)}`,
    {
      method: "GET",
    }
  );
  if (!res.ok || !res.data) {
    return [];
  }
  return res.data;
}

/**
 * PUBLIC_INTERFACE
 * createCommentAction: Server action to create a comment on a task.
 * Validates required fields, posts to /comments, and revalidates the project detail route.
 * Returns { error?: string } for client to show errors if any.
 */
export async function createCommentAction(_: unknown, formData: FormData) {
  "use server";

  // Avoid external calls during build
  if ((process.env.NEXT_PHASE || "").includes("build")) {
    return { error: "Action disabled during build." };
  }

  const task_id = String(formData.get("task_id") || "").trim();
  const project_id = String(formData.get("project_id") || "").trim(); // included to know which page to revalidate
  const content = String(formData.get("content") || "").trim();

  if (!task_id) {
    return { error: "Missing task context." };
  }
  if (!project_id) {
    return { error: "Missing project context." };
  }
  if (!content) {
    return { error: "Comment cannot be empty." };
  }

  const body: CommentCreateInput = { task_id, content };
  const res = await apiRequest<Comment>("/comments", { method: "POST", body });
  if (!res.ok) {
    return { error: res.error || "Failed to add comment." };
  }

  // Revalidate the project detail page to refresh tasks/comments view.
  revalidatePath(`/dashboard/projects/${project_id}`);
}
