import mongoose from "mongoose";

/**
 * Connect to MongoDB database
 * @param uri MongoDB connection string (defaults to MONGODB_URI env var)
 * @returns Mongoose connection instance
 */
export async function connectMongoDB(uri?: string) {
	const connectionString =
		uri || process.env.MONGODB_URI || "mongodb://localhost:27017/test";

	try {
		await mongoose.connect(connectionString);
		console.log("✓ MongoDB connected successfully");
		return mongoose.connection;
	} catch (error) {
		console.error("✗ MongoDB connection failed:", error);
		throw error;
	}
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectMongoDB() {
	await mongoose.disconnect();
	console.log("✓ MongoDB disconnected");
}

// Test function when file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	console.log("Testing MongoDB connection...");

	// Test connection string - can be overridden via command line argument
	const testUrl = process.argv[2] || "mongodb://root:s49k2jcd@usw.sealos.io:45516/?directConnection=true";
	console.log("Using test URL:", testUrl);

	connectMongoDB(testUrl)
		.then(async (connection) => {
			console.log("Connection state:", connection.readyState); // 1 = connected
			await disconnectMongoDB();
			process.exit(0);
		})
		.catch((error) => {
			console.error("Test failed:", error);
			process.exit(1);
		});
}
