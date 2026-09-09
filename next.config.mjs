/* global process */

import { getSecurityHeaders } from "./security-headers.mjs";

const isProduction = process.env.NODE_ENV === "production";
const securityHeaders = getSecurityHeaders(isProduction);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  experimental: {
    // Keep the limit aligned with the maximum property media payload.
    proxyClientMaxBodySize: "256mb",
  },
  productionBrowserSourceMaps: false,
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
