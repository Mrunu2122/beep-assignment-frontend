import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist', 'mammoth'],
  experimental: {
    // optimize package imports for icons
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;

