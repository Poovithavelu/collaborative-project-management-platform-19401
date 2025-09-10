import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static export to allow dynamic rendering (auth + API-dependent pages).
  // This prevents the build from attempting to fully pre-render pages that depend on runtime cookies and backend availability.
  output: undefined,
  experimental: {
    // Ensure app router dynamic usage is not blocked by export mode
  },
};

export default nextConfig;
