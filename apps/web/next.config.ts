import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@atlas/api-client",
    "@atlas/contracts",
    "@atlas/design-tokens",
    "@atlas/shared",
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    staleTimes: {
      dynamic: 180,
      static: 300,
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:4000/api/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
