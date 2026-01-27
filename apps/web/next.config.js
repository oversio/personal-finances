/* eslint-disable no-undef */
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mcpServer: true,
  },
  async rewrites() {
    const apiUrl = process.env.API_URL || "http://localhost:9000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
