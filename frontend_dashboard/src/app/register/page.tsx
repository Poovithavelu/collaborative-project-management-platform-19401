"use client";

import Link from "next/link";
import React from "react";
import { TextInput, PrimaryButton, ErrorBanner } from "@/components/ui";
import { registerAction } from "@/lib/auth";

// This route is a client component using server actions; it will not be statically prerendered.

export default function RegisterPage() {
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = (await registerAction(null as unknown as void, formData)) as
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
        <h1 className="text-2xl font-semibold text-black">Create account</h1>
        <p className="mt-1 text-sm text-gray-600">
          Start collaborating with your team on CollabTask.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <ErrorBanner message={error} />

          <TextInput
            name="name"
            type="text"
            label="Full name"
            placeholder="Jane Doe"
            autoComplete="name"
            required
          />
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
            autoComplete="new-password"
            required
          />
          <TextInput
            name="confirm"
            type="password"
            label="Confirm password"
            placeholder="********"
            autoComplete="new-password"
            required
          />

          <PrimaryButton type="submit" className="w-full" loading={pending}>
            Create account
          </PrimaryButton>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
