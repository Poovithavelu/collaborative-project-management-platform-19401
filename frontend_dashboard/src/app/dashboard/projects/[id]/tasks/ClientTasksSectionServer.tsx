import React from "react";
import dynamic from "next/dynamic";
import type { Task } from "@/lib/tasks";

/**
 * PUBLIC_INTERFACE
 * Server component wrapper that dynamically imports the client-only tasks section.
 * This ensures no accidental SSR-only behavior impacts the build and keeps boundaries explicit.
 */
const ClientTasksSection = dynamic(() => import("./ClientTasksSection"), {
  ssr: false,
});

export default function ClientTasksSectionServer({
  initialTasks,
  projectId,
}: {
  initialTasks: Task[];
  projectId: string;
}) {
  return <ClientTasksSection initialTasks={initialTasks} projectId={projectId} />;
}
