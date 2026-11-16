import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@launchpad/shared'],
  experimental: {
    // optimize package imports for icons
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
