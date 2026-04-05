import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@remotion/renderer",
    "@remotion/bundler",
    "@remotion/cli",
    "esbuild",
    "@rspack/core",
    "@rspack/binding",
    "@rspack/binding-linux-x64-gnu",
    "@rspack/binding-linux-x64-musl",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
