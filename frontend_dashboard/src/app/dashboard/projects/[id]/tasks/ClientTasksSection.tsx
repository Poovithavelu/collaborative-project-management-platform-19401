"use client";

import React from "react";
import { PrimaryButton } from "@/components/ui";
import TaskModal from "../TaskModal";
import type { Task } from "@/lib/tasks";
import { createTaskAction, updateTaskAction } from "@/lib/tasks";
import CommentsServer from "./CommentsServer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function ClientTasksSection({
  initialTasks,
  projectId,
}: {
  initialTasks: Task[];
  projectId: string;
}) {
  const [tasks] = React.useState<Task[]>(initialTasks);
  const [openCreate, setOpenCreate] = React.useState(false);
  const [editTask, setEditTask] = React.useState<Task | null>(null);

  // Optimistic UI helpers (optional): since server actions revalidate and SSR reloads,
  // we keep optimistic updates minimal. Here, we do no local mutations beyond controlling modals.

  return (
    <ErrorBoundary>
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Tasks</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {tasks.length} task{tasks.length === 1 ? "" : "s"}
            </span>
            <PrimaryButton onClick={() => setOpenCreate(true)}>
              Add Task
            </PrimaryButton>
          </div>
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
                      <span className="font-medium text-black truncate">
                        {t.title}
                      </span>
                      <span className="ml-2 shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {t.status || "todo"}
                      </span>
                    </div>
                    {t.description ? (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-3 break-words">
                        {t.description}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-400 italic">
                        No description
                      </p>
                    )}
                  </div>
                  <div className="ml-3 flex items-start gap-2">
                    <span className="shrink-0 rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-500">
                      {new Date(t.created_at).toLocaleDateString()}
                    </span>
                    <button
                      className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100"
                      onClick={() => setEditTask(t)}
                      aria-label={`Edit task ${t.title}`}
                    >
                      Edit
                    </button>
                  </div>
                </div>
                {t.assignee_id && (
                  <div className="mt-2 text-xs text-gray-500">
                    Assignee: {t.assignee_id}
                  </div>
                )}
                {/* Comments section for this task */}
                <CommentsServer taskId={t.id} projectId={projectId} />
              </li>
            ))}
          </ul>
        )}

        {openCreate && (
          <TaskModal
            mode="create"
            projectId={projectId}
            onClose={() => setOpenCreate(false)}
            onSubmitAction={createTaskAction}
          />
        )}

        {editTask && (
          <TaskModal
            mode="edit"
            projectId={projectId}
            defaultValues={{
              task_id: editTask.id,
              title: editTask.title,
              description: editTask.description ?? "",
              status: editTask.status || "todo",
              assignee_id: editTask.assignee_id ?? "",
            }}
            onClose={() => setEditTask(null)}
            onSubmitAction={updateTaskAction}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
