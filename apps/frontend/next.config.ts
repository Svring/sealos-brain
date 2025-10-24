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
	turbopack: {
		rules: {
			"*.md": {
				loaders: ["ignore-loader"],
				as: "*.js", // Specify the output as JavaScript (though ignored)
			},
		},
	},
	// Externalize packages that bring native binaries or register esbuild at runtime
	serverExternalPackages: [
		"esbuild",
		"esbuild-register",
		"drizzle-kit",
		"@payloadcms/db-postgres",
		"@payloadcms/drizzle",
	],
};

export default withPayload(nextConfig);
