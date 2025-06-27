import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.cursor.com",
      },
    ],
  },
  webpack: (config) => {
    // Prevent server-only modules from causing build errors in the client bundle
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
    };
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withPayload(nextConfig);
