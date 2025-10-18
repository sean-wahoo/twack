import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "cdn.discordapp.com",
      },
      {
        hostname: "images.igdb.com",
      },
    ],
  },
};

export default nextConfig;
