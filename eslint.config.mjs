import path from 'path'; // --- NEW: Import the 'path' module from Node.js
import { fileURLToPath } from 'url';
import withPWA from 'next-pwa';

// Helper to get the directory name in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your existing PWA configuration
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing configuration for images and server actions
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', 
    },
  },
  
  // --- THIS IS THE FIX ---
  // This 'webpack' configuration block provides an explicit instruction
  // to both Webpack and Turbopack on how to resolve the '@/' alias.
  // It tells them that '@' should always point to the 'src' directory.
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },
};

export default pwaConfig(nextConfig);
