import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "gateway.pinata.cloud" },
      { protocol: "https", hostname: "cloudflare-ipfs.com" },
    ],
  },
  experimental: {
    // Enable server actions
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
  webpack: (config) => {
    // Required for stellar-sdk in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
