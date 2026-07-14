import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	trailingSlash: true,
	images: { formats: ["image/avif", "image/webp"] },
	poweredByHeader: false,
	experimental: {
		cpus: 1,
		staticGenerationMaxConcurrency: 1,
		staticGenerationMinPagesPerWorker: 40,
	},
	turbopack: { root: process.cwd() },
};

export default nextConfig;
