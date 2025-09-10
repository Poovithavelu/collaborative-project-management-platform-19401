"use client";

import Link from "next/link";
import React from "react";
import { TextInput, PrimaryButton, ErrorBanner } from "@/components/ui";

// Use a typed server action via formAction binding
import { loginAction } from "@/lib/auth";

export default function LoginPage() {
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    // Call server action; if it returns an object, show error; on success it will redirect.
    try {
      const result = (await loginAction(null as unknown as void, formData)) as
        | { error?: string }
        | void;
      if (result && "error" in result && result.error) {
        setError(result.error);
        setPending(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      setError(message);
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-black">Sign in</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back to CollabTask.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <ErrorBanner message={error} />

          <TextInput
            name="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <TextInput
            name="password"
            type="password"
            label="Password"
            placeholder="********"
            autoComplete="current-password"
            required
          />
          <PrimaryButton type="submit" className="w-full" loading={pending}>
            Sign in
          </PrimaryButton>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
