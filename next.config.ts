import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['jszip', '@react-pdf/renderer', '@myriaddreamin/typst-ts-node-compiler'],
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    NEXT_PUBLIC_FIREBASE_DATABASE_URL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
    NEXT_PUBLIC_MEDIA_MAX_MB: process.env.NEXT_PUBLIC_MEDIA_MAX_MB,
  },
  /* config options here */
  eslint: {
    // ESLint warnings ainda permitidos no build — fix incremental
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript strict — typecheck deve passar
    ignoreBuildErrors: false,
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
