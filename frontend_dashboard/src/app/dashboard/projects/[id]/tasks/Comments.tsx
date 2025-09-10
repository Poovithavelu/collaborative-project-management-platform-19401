"use client";

import React from "react";
import { PrimaryButton, ErrorBanner } from "@/components/ui";
import type { Comment } from "@/lib/comments";

/**
 * PUBLIC_INTERFACE
 * CommentsListAndForm: Client component to render comments for a task and provide a form
 * to add a new comment via a server action passed from the server wrapper.
 *
 * Props:
 * - taskId: string
 * - projectId: string (for revalidation context)
 * - initialComments: Comment[] (fetched on server)
 * - createCommentAction: server action signature (prev, formData) => Promise<{ error?: string } | void>
 */
import { useRouter } from "next/navigation";

export default function CommentsListAndForm({
  taskId,
  projectId,
  initialComments,
  createCommentAction,
}: {
  taskId: string;
  projectId: string;
  initialComments: Comment[];
  createCommentAction: (
    prevState: unknown,
    formData: FormData
  ) => Promise<{ error?: string } | void>;
}) {
  const [comments] = React.useState<Comment[]>(initialComments);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setPending(true);

    const fd = new FormData(e.currentTarget);
    // Ensure required hidden fields exist
    fd.set("task_id", taskId);
    fd.set("project_id", projectId);

    try {
      const res = await createCommentAction(null as unknown as void, fd);
      if (res && "error" in res && res.error) {
        setError(res.error);
        setPending(false);
        return;
      }
      setPending(false);
      (e.currentTarget as HTMLFormElement).reset();
      // Trigger a soft refresh to re-fetch server data for this page (comments/tasks)
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error.";
      setError(msg);
      setPending(false);
    }
  }

  return (
    <div className="mt-3 border-t pt-3">
      <h4 className="text-sm font-medium text-gray-700">Comments</h4>

      {comments.length === 0 ? (
        <div className="mt-2 text-sm text-gray-500">No comments yet.</div>
      ) : (
        <ul className="mt-2 space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="rounded-md bg-gray-50 p-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-800 break-words">
                  {c.content}
                </span>
                <span className="ml-3 shrink-0 text-[11px] text-gray-500">
                  {new Date(c.created_at).toLocaleString()}
                </span>
              </div>
              {c.author_id && (
                <div className="mt-1 text-[11px] text-gray-500">
                  by {c.author_id}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onSubmit} className="mt-3 space-y-2">
        <ErrorBanner message={error} />
        <label className="block w-full">
          <span className="block text-sm text-gray-700 mb-1">
            Add a comment
          </span>
          <textarea
            name="content"
            required
            placeholder="Write a comment..."
            className="w-full rounded-md border px-3 py-2 outline-none bg-white text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
            rows={3}
          />
        </label>
        {/* Hidden context fields for server action */}
        <input type="hidden" name="task_id" value={taskId} />
        <input type="hidden" name="project_id" value={projectId} />
        <div className="flex items-center justify-end">
          <PrimaryButton type="submit" loading={pending}>
            Comment
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
