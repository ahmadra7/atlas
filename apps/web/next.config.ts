import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@atlas/api-client",
    "@atlas/contracts",
    "@atlas/design-tokens",
    "@atlas/shared",
  ],
};

export default nextConfig;
