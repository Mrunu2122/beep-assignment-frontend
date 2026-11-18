import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['unpdf', 'mammoth'],
  experimental: {
    // optimize package imports for icons
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;

