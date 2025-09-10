import React from "react";
import type { Task } from "@/lib/tasks";
import ClientTasksSection from "./ClientTasksSection";

/**
 * PUBLIC_INTERFACE
 * Server component wrapper that imports the client-only tasks section.
 * The imported component has "use client" at the top, ensuring proper boundary.
 */
export default function ClientTasksSectionServer({
  initialTasks,
  projectId,
}: {
  initialTasks: Task[];
  projectId: string;
}) {
  return <ClientTasksSection initialTasks={initialTasks} projectId={projectId} />;
}
