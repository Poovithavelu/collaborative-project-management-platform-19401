import React from "react";

// Use dynamic rendering to align with dashboard SSR pattern.
export const dynamic = "force-dynamic";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  // This layout is minimal; it lets the parent /dashboard/layout provide header/auth context.
  return <div className="space-y-4">{children}</div>;
}
