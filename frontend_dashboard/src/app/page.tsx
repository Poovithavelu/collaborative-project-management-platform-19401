import Link from "next/link";

// Force dynamic to avoid static optimization stalls in export-less mode.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-black text-4xl font-semibold">CollabTask</h1>
        <p className="text-gray-600">
          Collaborate on projects and tasks with your team.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-md border px-4 py-2 hover:bg-gray-100"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
