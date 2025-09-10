import type { Metadata } from "next";
import "./globals.css";

// App-level metadata
export const metadata: Metadata = {
  title: "Minimal Next.js App",
  description: "Ultra-minimal Next.js application",
};

// Force dynamic rendering across the app; required for cookie-based auth and server actions
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
