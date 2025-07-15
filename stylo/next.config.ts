import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'your-domain.com'], // Add your image domains here
  },
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;
