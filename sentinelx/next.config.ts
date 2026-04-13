import path from "path";
import type { NextConfig } from "next";

const backendOrigin =
  process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8080";

const nextConfig: NextConfig = {
  // Parent folder also has package-lock.json; pin Turbopack root to this app
  turbopack: {
    root: path.join(__dirname),
  },
  // Allow dev HMR when opening the app via LAN IP (see Next.js allowedDevOrigins)
  allowedDevOrigins: ["169.254.83.107"],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin}/api/v1/:path*`,
      },
    ];
  },
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Environment variables for Vercel
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'SentinelX',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    NEXT_PUBLIC_AUTH_PROVIDER: process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'supabase',
  },
  // Build optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
