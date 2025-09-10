import type { NextConfig } from "next";

/**
 * Use default server runtime (Node.js) instead of static export to support:
 * - Server Actions (login/register/logout/switchOrg)
 * - Cookie-based auth and dynamic routes (/dashboard)
 * If you need a static export later, you'll need to mock API and remove server actions.
 */
const nextConfig: NextConfig = {
  // Keep default output (no "export") so server features work.
  experimental: {
    // Ensure server actions are enabled by default (Next 15+)
  },
};

export default nextConfig;
