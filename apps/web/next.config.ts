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
