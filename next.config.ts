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
  webpack: (config, { isServer }) => {
    // Exclude Firebase Admin SDK from client bundle
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Mark Firebase Admin and its deps as external for client
        'firebase-admin': false,
        'firebase-admin/app': false,
        'firebase-admin/auth': false,
        'firebase-admin/firestore': false,
      };
    }
    return config;
  },
};

export default nextConfig;
