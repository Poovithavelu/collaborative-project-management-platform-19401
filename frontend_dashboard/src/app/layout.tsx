import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
