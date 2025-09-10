"use client";

import React from "react";
import { Spinner } from "@/components/ui";

/**
 * PUBLIC_INTERFACE
 * Dashboard route-level loading UI shown by Next.js during suspense or route transitions.
 * Provides a consistent page-level spinner to indicate activity.
 */
export default function DashboardLoading() {
  return (
    <div className="py-10 flex items-center justify-center">
      <div className="inline-flex items-center gap-3 rounded-lg border bg-white px-4 py-3 text-gray-700">
        <Spinner className="text-blue-600" />
        <span>Loading dashboard…</span>
      </div>
    </div>
  );
}
