/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@omniforge/shared', '@omniforge/ui'],
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;

