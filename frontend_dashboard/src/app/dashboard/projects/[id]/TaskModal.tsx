"use client";

import React from "react";
import { PrimaryButton, TextInput, ErrorBanner } from "@/components/ui";

export type TaskModalProps = {
  mode: "create" | "edit";
  projectId: string;
  defaultValues?: {
    task_id?: string;
    title?: string;
    description?: string | null;
    status?: string;
    assignee_id?: string | null;
  };
  onClose: () => void;
  /**
   * Server action signatures accepted:
   * - createTaskAction(prevState, formData) => Promise<{ error?: string } | void>
   * - updateTaskAction(prevState, formData) => Promise<{ error?: string } | void>
   */
  onSubmitAction: (prevState: unknown, formData: FormData) => Promise<{ error?: string } | void>;
};

export default function TaskModal({
  mode,
  projectId,
  defaultValues,
  onClose,
  onSubmitAction,
}: TaskModalProps) {
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setPending(true);

    const fd = new FormData(e.currentTarget);
    // Enforce required hidden fields
    fd.set("project_id", projectId);
    if (mode === "edit" && defaultValues?.task_id) {
      fd.set("task_id", defaultValues.task_id);
    }

    try {
      const result = await onSubmitAction(null as unknown as void, fd);
      if (result && "error" in result && result.error) {
        setError(result.error);
        setPending(false);
        return;
      }
      setPending(false);
      onClose();
      (e.currentTarget as HTMLFormElement).reset();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error.";
      setError(msg);
      setPending(false);
    }
  }

  const isEdit = mode === "edit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-xl border bg-white p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black">{isEdit ? "Edit Task" : "Create Task"}</h3>
          <button
            className="rounded-md border px-2 py-1 text-sm hover:bg-gray-100"
            onClick={onClose}
            aria-label={isEdit ? "Close edit task" : "Close create task"}
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <ErrorBanner message={error} />

          {/* Hidden Context Fields */}
          <input type="hidden" name="project_id" value={projectId} />
          {isEdit && <input type="hidden" name="task_id" value={defaultValues?.task_id || ""} />}

          <TextInput
            name="title"
            type="text"
            label="Title"
            placeholder="e.g., Draft project proposal"
            required
            defaultValue={defaultValues?.title || ""}
          />

          <label className="block w-full">
            <span className="block text-sm text-gray-700 mb-1">Description (optional)</span>
            <textarea
              name="description"
              placeholder="Add more details to the task"
              className="w-full rounded-md border px-3 py-2 outline-none bg-white text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
              rows={4}
              defaultValue={(defaultValues?.description as string | undefined) ?? ""}
            />
          </label>

          <label className="block w-full">
            <span className="block text-sm text-gray-700 mb-1">Status</span>
            <select
              name="status"
              className="w-full rounded-md border px-3 py-2 outline-none bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
              defaultValue={(defaultValues?.status as string | undefined) || "todo"}
            >
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>

          <TextInput
            name="assignee_id"
            type="text"
            label="Assignee ID (optional)"
            placeholder="Enter user ID"
            defaultValue={defaultValues?.assignee_id || ""}
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100"
              onClick={onClose}
            >
              Cancel
            </button>
            <PrimaryButton type="submit" loading={pending}>
              {isEdit ? "Save changes" : "Create"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
