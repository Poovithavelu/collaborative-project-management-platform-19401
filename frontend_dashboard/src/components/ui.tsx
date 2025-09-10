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

export function PrimaryButton({ loading, className, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={[
        "inline-flex items-center justify-center rounded-md",
        "bg-blue-600 text-white px-4 py-2",
        "hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
        className || "",
      ].join(" ")}
    >
      {loading ? "Please wait..." : children}
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
