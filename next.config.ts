import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  
  // Enable experimental features
  experimental: {
    esmExternals: true,
  },

  images: {
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
