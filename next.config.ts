import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components is off on purpose: every page here is per-user (behind
  // login), so prerender caching gains little and adds Suspense rules that
  // make builds fail in confusing ways. Pages are simply rendered on request.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
