"use client";

import React from "react";

/**
 * PUBLIC_INTERFACE
 * ErrorFallback: A simple, reusable friendly error message component.
 * Use as the fallback prop for ErrorBoundary or inline in sections.
 */
export default function ErrorFallback({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="m-4 rounded-lg border border-red-200 bg-red-50 text-red-800 p-4"
    >
      <div className="font-semibold">{title}</div>
      <p className="text-sm mt-1">{message}</p>
    </div>
  );
}
