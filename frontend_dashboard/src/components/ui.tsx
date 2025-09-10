"use client";

import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function TextInput({ label, error, className, ...props }: InputProps) {
  return (
    <label className="block w-full">
      {label && (
        <span className="block text-sm text-gray-700 mb-1">{label}</span>
      )}
      <input
        {...props}
        className={[
          "w-full rounded-md border px-3 py-2 outline-none",
          "bg-white text-black placeholder-gray-400",
          "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          error ? "border-red-500" : "border-gray-300",
          className || "",
        ].join(" ")}
      />
      {error && (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={["animate-spin h-4 w-4 text-white", className || ""].join(" ")}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export function PrimaryButton({ loading, className, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={[
        "inline-flex items-center justify-center rounded-md",
        "bg-blue-600 text-white px-4 py-2",
        "hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
        className || "",
      ].join(" ")}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <Spinner />
          <span>Processing…</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="w-full rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
      {message}
    </div>
  );
}

// PUBLIC_INTERFACE
export { Spinner };
