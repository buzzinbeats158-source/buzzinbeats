import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Raw uploads (product/redirect-link/digital-product images, plus
      // digital-product files) go through Server Actions before resizing —
      // the framework default (1mb) is too small for an unedited photo.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
