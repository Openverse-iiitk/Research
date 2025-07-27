import type { NextConfig } from "next";

// Security headers
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co https://*.vercel.app; frame-ancestors 'none'; base-uri 'self';`,
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
];

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

  // Add security headers globally
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
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
