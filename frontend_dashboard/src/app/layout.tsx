import type { Metadata } from "next";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ErrorFallback from "@/components/ErrorFallback";
import { ToastProvider } from "@/components/ToastProvider";

// Root layout is dynamic to avoid static optimization for auth-guarded routes.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CollabTask",
  description: "Collaborate on projects and tasks with your team.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ErrorBoundary
          fallback={
            <main className="min-h-screen flex items-center justify-center px-4">
              <div className="w-full max-w-lg">
                <ErrorFallback />
              </div>
            </main>
          }
        >
          <ToastProvider>{children}</ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
