import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export configuration
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during build (if needed)
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Exclude LaunchPad directory from compilation
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.tsx?$/,
      exclude: /LaunchPad/,
    });
    return config;
  },
  
  // Disable server-side features for static export
  experimental: {
    esmExternals: true,
  },
  
  images: {
    // For static export, we need to disable the default Image Optimization API
    unoptimized: true,
    // Allow external image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Enable optimized images
    formats: ['image/webp', 'image/avif'],
    // Local images are enabled by default
    domains: [],
  },
};

export default nextConfig;
