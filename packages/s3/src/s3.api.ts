import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";

let s3Client: S3Client | null = null;

export interface S3Config {
	region: string;
	accessKeyId: string;
	secretAccessKey: string;
	endpoint?: string;
	forcePathStyle?: boolean;
}

/**
 * Connect to S3-compatible storage
 * @param config S3 configuration object
 * @returns S3Client instance
 */
export async function connectS3(config: S3Config): Promise<S3Client> {
	try {
		s3Client = new S3Client({
			region: config.region,
			credentials: {
				accessKeyId: config.accessKeyId,
				secretAccessKey: config.secretAccessKey,
			},
			endpoint: config.endpoint,
			forcePathStyle: config.forcePathStyle || false,
		});

		// Test the connection by listing buckets
		await s3Client.send(new HeadBucketCommand({ Bucket: "test" }));
		console.log("✓ S3 connected successfully");
		return s3Client;
	} catch (error) {
		// If bucket doesn't exist, that's still a successful connection
		if (error instanceof Error && error.name === "NotFound") {
			console.log(
				"✓ S3 connected successfully (bucket not found, but connection works)",
			);
			return s3Client as S3Client;
		}
		console.error("✗ S3 connection failed:", error);
		throw error;
	}
}

/**
 * Disconnect from S3 (cleanup)
 */
export function disconnectS3() {
	s3Client = null;
	console.log("✓ S3 disconnected");
}

/**
 * Get the current S3 client instance
 */
export function getS3() {
	if (!s3Client) {
		throw new Error("S3 not connected. Call connectS3() first.");
	}
	return s3Client;
}

// Test function when file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	console.log("Testing S3 connection...");

	// Parse connection string from command line argument or use default
	const connectionString =
		process.argv[2] || "s3://accessKey:secretKey@region.endpoint.com/bucket";
	console.log("Using connection string:", connectionString);

	// Parse connection string (format: s3://accessKey:secretKey@region.endpoint.com/bucket)
	const url = new URL(connectionString);
	const config: S3Config = {
		region: url.hostname.split(".")[0] || "us-east-1",
		accessKeyId: url.username,
		secretAccessKey: url.password,
		endpoint: url.hostname.includes(".")
			? `https://${url.hostname}`
			: undefined,
		forcePathStyle: true,
	};

	connectS3(config)
		.then(async (client) => {
			console.log("S3 client created:", !!client);
			disconnectS3();
			process.exit(0);
		})
		.catch((error) => {
			console.error("Test failed:", error);
			process.exit(1);
		});
}
