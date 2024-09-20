/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.audioworklet\.js$/,
      type: "asset/source",
    });

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
