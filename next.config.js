/** @type {import('next').NextConfig} */
const nextConfig = {
  // Moved from experimental.serverComponentsExternalPackages (deprecated)
  serverExternalPackages: ['@neondatabase/serverless'],
  // Allow cross-origin requests from Replit domains
  experimental: {
    allowedDevOrigins: [
      'localhost',
      '127.0.0.1',
      '*.replit.dev',
      '*.picard.replit.dev',
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  env: {
    // Only expose public environment variables
    NEXT_PUBLIC_STRIPE_KEY: process.env.VITE_STRIPE_PUBLIC_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;