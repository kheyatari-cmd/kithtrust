/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    // Suppress warning "Critical dependency: the request of a dependency is an expression"
    config.module = config.module || {};
    config.module.exprContextCritical = false;

    // Ignore specific warnings regarding dynamic requires in node modules
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /node_modules\/require-addon/ },
      { module: /node_modules\/sodium-native/ },
      { message: /Critical dependency/ },
    ];

    return config;
  },
};

module.exports = nextConfig;
