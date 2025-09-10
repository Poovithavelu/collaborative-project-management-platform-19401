"use client";

import React from "react";

/**
 * PUBLIC_INTERFACE
 * ErrorBoundaryProps defines the props accepted by the ErrorBoundary component.
 * - children: React nodes to render within the boundary.
 * - fallback?: Optional custom fallback ReactNode. If not provided, a default friendly error UI is shown.
 * - onError?: Callback invoked when an error is caught; useful for custom handling.
 */
export type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
};

/**
 * PUBLIC_INTERFACE
 * Remote error logger function. Replace implementation to forward logs to a remote service (Sentry, Logtail, custom API).
 * By default, it logs to the console. You may wire this to your backend:
 *  - fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/frontend-error`, { method:'POST', body: JSON.stringify({...}) })
 */
export async function logErrorRemotely(payload: {
  message: string;
  stack?: string;
  componentStack?: string;
  pathname?: string;
  userAgent?: string;
  timestamp?: string;
}) {
  // Basic console logging for now; replace with remote ingestion as needed.
  // Keep non-blocking to avoid UI stalls.
  console.error("[ErrorBoundary] Captured error:", payload);
}

/**
 * PUBLIC_INTERFACE
 * ErrorBoundary: Classic React error boundary to catch render-time errors in client components.
 * Shows a user-friendly message and logs diagnostics for developers.
 *
 * Usage:
 *  <ErrorBoundary>
 *    <YourClientComponent />
 *  </ErrorBoundary>
 *
 * You can optionally pass a custom fallback:
 *  <ErrorBoundary fallback={<div>Something went wrong. Try again.</div>}>
 *    <YourClientComponent />
 *  </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const info = {
      message: error?.message || "Unknown error",
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      pathname:
        typeof window !== "undefined" ? window.location?.pathname : undefined,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
    };

    // Console and remote logging
    console.error("[ErrorBoundary] componentDidCatch", error, errorInfo);
    try {
      await logErrorRemotely(info);
    } catch {
      // Best-effort; swallow to avoid cascading failures
    }

    // Notify consumer if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch {
        // ignore
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      // Default friendly UI
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="m-4 rounded-lg border border-red-200 bg-red-50 text-red-800 p-4"
        >
          <div className="font-semibold">Something went wrong.</div>
          <p className="text-sm mt-1">
            An unexpected error occurred while rendering this section. Please
            try reloading the page. If the problem persists, contact support.
          </p>
          <details className="mt-2 text-xs text-red-700 whitespace-pre-wrap">
            {this.state.error?.message}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
