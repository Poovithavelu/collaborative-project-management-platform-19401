import React from "react";
import ProjectsList from "./ProjectsList";
import { createProjectAction } from "@/lib/projects";
import type { Project } from "@/lib/projects";

/**
 * Server wrapper to pass server action reference to client safely.
 * This avoids type leakage and keeps the server/client boundary explicit.
 */
export default function ProjectsListServer({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  return (
    <ProjectsList
      initialProjects={initialProjects}
      // Bind the action to a stable reference; no args needed here
      createProjectAction={createProjectAction}
    />
  );
}
