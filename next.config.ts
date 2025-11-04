import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  reactCompiler: true,
  transpilePackages: ["jotai-devtools"],
  sassOptions: {
    implementation: "sass-embedded",
  },
  images: {
    qualities: [25, 50, 75, 100],
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
