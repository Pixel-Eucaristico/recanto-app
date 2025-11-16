import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily ignore TypeScript errors during builds
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Aceita qualquer domínio HTTPS
      },
      {
        protocol: 'http',
        hostname: '**', // Aceita qualquer domínio HTTP
      },
    ],
  },
};

export default nextConfig;
