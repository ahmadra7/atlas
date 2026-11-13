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
    if (process.env.NODE_ENV === "production") return [];
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:4000/api/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
