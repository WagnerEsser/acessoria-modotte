/* global process */

import { getSecurityHeaders } from "./security-headers.mjs";

const isProduction = process.env.NODE_ENV === "production";
const securityHeaders = getSecurityHeaders(isProduction);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
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
