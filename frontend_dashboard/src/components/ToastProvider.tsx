"use client";

import React from "react";

/**
 * PUBLIC_INTERFACE
 * Toast type and payload.
 */
export type Toast = {
  id: string;
  title?: string;
  message: string;
  type?: "success" | "error" | "info";
  duration?: number; // ms
};

/**
 * PUBLIC_INTERFACE
 * ToastContextValue defines the public API for adding and removing toasts.
 */
export type ToastContextValue = {
  addToast: (t: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clear: () => void;
};

// Simple context for toasts
const ToastContext = React.createContext<ToastContextValue | null>(null);

/**
 * PUBLIC_INTERFACE
 * useToast: Hook to access toast API in client components.
 */
export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    // Provide a no-op fallback to avoid crashes; warn in console to aid integration.
    if (typeof window !== "undefined") {
      console.warn("useToast used outside of ToastProvider. Returning no-op functions.");
    }
    return {
      addToast: () => "",
      removeToast: () => {},
      clear: () => {},
    };
  }
  return ctx;
}

/**
 * PUBLIC_INTERFACE
 * ToastProvider: Renders a portal-like container at the document root to show toasts.
 * Place once near the root layout body.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((t: Omit<Toast, "id">) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const toast: Toast = {
      id,
      type: t.type || "info",
      duration: t.duration ?? (t.type === "error" ? 6000 : 3500),
      ...t,
    };
    setToasts((prev) => [...prev, toast]);

    if (toast.duration && toast.duration > 0) {
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, toast.duration);
    }

    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const clear = React.useCallback(() => setToasts([]), []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clear }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-0 z-[60] flex items-start justify-end p-4"
      >
        <div className="flex w-full max-w-sm flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              role="status"
              className={[
                "pointer-events-auto rounded-lg border px-3 py-2 shadow-md",
                t.type === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : t.type === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-gray-200 bg-white text-gray-800",
              ].join(" ")}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {t.type === "success" ? "✅" : t.type === "error" ? "⚠️" : "ℹ️"}
                </div>
                <div className="min-w-0 flex-1">
                  {t.title && <div className="font-medium">{t.title}</div>}
                  <div className="text-sm break-words">{t.message}</div>
                </div>
                <button
                  aria-label="Dismiss notification"
                  className="ml-2 shrink-0 rounded-md border px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                  onClick={() => removeToast(t.id)}
                >
                  Close
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
