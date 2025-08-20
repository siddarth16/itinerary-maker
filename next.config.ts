import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Disable ESLint during builds for MVP demo
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds for demo
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
