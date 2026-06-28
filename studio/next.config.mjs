/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  // Static export for GitHub Pages (no server runtime needed).
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  // three.js / R3F ship ESM; transpile so Next bundles them cleanly.
  transpilePackages: ["three"],
};

export default nextConfig;
