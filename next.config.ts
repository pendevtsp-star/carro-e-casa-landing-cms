import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  images: {
    localPatterns: [
      {
        pathname: "/brand/**",
      },
      {
        pathname: "/generated/**",
      },
      {
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
