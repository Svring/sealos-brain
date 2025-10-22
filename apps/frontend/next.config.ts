import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		unoptimized: true,
	},
	async rewrites() {
		return [
			{
				source: "/", // Root path
				destination: "/new", // Map to /new
			},
		];
	},
};

export default withPayload(nextConfig);
