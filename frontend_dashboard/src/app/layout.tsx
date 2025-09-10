import type { Metadata } from "next";
import "./globals.css";

// Root layout is dynamic to avoid static optimization for auth-guarded routes.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Minimal Next.js App",
  description: "Ultra-minimal Next.js application",
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
