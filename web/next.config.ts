import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack instead of turbopack to avoid # in path issues
  // turbopack has issues with special chars in directory names
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
