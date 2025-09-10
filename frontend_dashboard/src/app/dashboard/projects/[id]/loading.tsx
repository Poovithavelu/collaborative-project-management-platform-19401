"use client";

import React from "react";
import Link from "next/link";
import { Spinner } from "@/components/ui";

/**
 * PUBLIC_INTERFACE
 * Project detail route-level loading UI shown by Next.js during suspense or route transitions.
 * Provides a contextual spinner and a back link for user orientation.
 */
export default function ProjectLoading() {
  return (
    <section className="space-y-6 py-10">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-black">Project</h1>
      </div>
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-3 rounded-lg border bg-white px-4 py-3 text-gray-700">
          <Spinner className="text-blue-600" />
          <span>Loading project…</span>
        </div>
      </div>
    </section>
  );
}
