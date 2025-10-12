import type { NextConfig } from "next";

// We import the PWA plugin
const withPWA = require('next-pwa')({
  dest: 'public', // The destination directory for the service worker files.
  register: true, // Automatically register the service worker.
  skipWaiting: true, // Forces the waiting service worker to become the active one.
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development mode for easier debugging.
});

// This is YOUR existing Next.js configuration.
// It includes the important settings for remote images and server actions.
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // ===================================================================
      // THIS IS THE FIX: Added the Cloudinary hostname to the list.
      // ===================================================================
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Removed the old Supabase hostname as it's no longer needed.
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', 
    },
  },
  // Fix Turbopack configuration warnings
  turbopack: {
    root: 'C:\\Users\\LADE SAI TEJA\\OneDrive\\Desktop\\Campus-OLX\\campus-olx',
  },
};

// We wrap your existing config with the withPWA function.
// This merges the PWA settings into your project without overwriting anything.
export default withPWA(nextConfig);
