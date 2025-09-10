"use client";

import React from "react";
import Link from "next/link";
import { PrimaryButton, TextInput, ErrorBanner, Spinner } from "@/components/ui";
import type { Project } from "@/lib/projects";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useToast } from "@/components/ToastProvider";

/**
 * Client-side component to render the project list and handle "Create Project" modal.
 */
export default function ProjectsList({
  initialProjects,
  createProjectAction,
}: {
  initialProjects: Project[];
  /**
   * Server action signature: (prevState, formData) => Promise<{ error?: string } | void>
   * We accept it as any to keep client/server boundary clean without importing the action type in client bundle.
   */
  createProjectAction: (prevState: unknown, formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [pending, setPending] = React.useState(false);
  const { addToast } = useToast();

  async function onCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setPending(true);

    // Optimistic UX: show a loading toast
    addToast({
      type: "info",
      title: "Creating project",
      message: "Please wait while we create your project…",
      duration: 3000,
    });

    try {
      const fd = new FormData(e.currentTarget);
      const name = String(fd.get("name") || "").trim();
      const result = await createProjectAction(null as unknown as void, fd);
      if (result && "error" in result && result.error) {
        setError(result.error);
        setPending(false);
        addToast({
          type: "error",
          title: "Create failed",
          message: result.error || "Unable to create project.",
        });
        return;
      }
      // Success
      setOpen(false);
      setPending(false);
      (e.currentTarget as HTMLFormElement).reset();

      addToast({
        type: "success",
        title: "Project created",
        message: name ? `“${name}” was created.` : "Project created.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error.";
      setError(msg);
      setPending(false);
      addToast({
        type: "error",
        title: "Create failed",
        message: msg,
      });
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Projects</h2>
        <PrimaryButton onClick={() => setOpen(true)}>Create Project</PrimaryButton>
      </div>

      {initialProjects.length === 0 ? (
        <div className="rounded-lg border bg-white p-4 text-gray-700">
          No projects yet. Create your first project to get started.
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {initialProjects.map((p) => (
            <li key={p.id} className="rounded-lg border bg-white hover:shadow-sm transition">
              <Link href={`/dashboard/projects/${encodeURIComponent(p.id)}`} className="block p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-black">{p.name}</h3>
                    {p.description ? (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-3">{p.description}</p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-400 italic">No description</p>
                    )}
                  </div>
                  <span className="ml-3 shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border bg-white p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black">Create Project</h3>
              <button
                className="rounded-md border px-2 py-1 text-sm hover:bg-gray-100"
                onClick={() => setOpen(false)}
                aria-label="Close create project"
              >
                Close
              </button>
            </div>

            <form onSubmit={onCreateSubmit} className="mt-4 space-y-3">
              <ErrorBanner message={error} />
              <TextInput
                name="name"
                type="text"
                label="Project name"
                placeholder="e.g., Website Redesign"
                required
              />
              <label className="block w-full">
                <span className="block text-sm text-gray-700 mb-1">Description (optional)</span>
                <textarea
                  name="description"
                  placeholder="Brief project description"
                  className="w-full rounded-md border px-3 py-2 outline-none bg-white text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  rows={4}
                />
              </label>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                >
                  Cancel
                </button>
                <PrimaryButton type="submit" loading={pending}>
                  {pending ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner />
                      <span>Creating…</span>
                    </span>
                  ) : (
                    "Create"
                  )}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
}
