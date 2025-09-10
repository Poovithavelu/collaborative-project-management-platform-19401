import React from "react";
import dynamic from "next/dynamic";
import type { Comment } from "@/lib/comments";
import { listCommentsByTask, createCommentAction } from "@/lib/comments";

/**
 * PUBLIC_INTERFACE
 * Server wrapper to fetch comments for a task and pass them along with the server action
 * to a client-only Comments component.
 */
const CommentsListAndForm = dynamic(() => import("./Comments"), { ssr: false });

export default async function CommentsServer({
  taskId,
  projectId,
}: {
  taskId: string;
  projectId: string;
}) {
  const comments: Comment[] = await listCommentsByTask(taskId);
  return (
    <CommentsListAndForm
      taskId={taskId}
      projectId={projectId}
      initialComments={comments}
      createCommentAction={createCommentAction}
    />
  );
}
