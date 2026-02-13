import type { NextConfig } from "next";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://136.115.53.103";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
