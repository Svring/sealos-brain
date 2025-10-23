import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let db: PostgresJsDatabase | null = null;
let client: postgres.Sql | null = null;

/**
 * Connect to PostgreSQL database using Drizzle ORM
 * @param connectionString PostgreSQL connection string (defaults to POSTGRESQL_URL env var)
 * @returns Drizzle database instance
 */
export async function connectPostgreSQL(connectionString?: string) {
	const url =
		connectionString ||
		process.env.POSTGRESQL_URL ||
		"postgresql://postgres:password@localhost:5432/test";

	try {
		client = postgres(url);
		db = drizzle(client);

		// Test connection
		await client`SELECT 1`;
		console.log("✓ PostgreSQL connected successfully");
		return db;
	} catch (error) {
		console.error("✗ PostgreSQL connection failed:", error);
		throw error;
	}
}

/**
 * Disconnect from PostgreSQL
 */
export async function disconnectPostgreSQL() {
	if (client) {
		await client.end();
		client = null;
		db = null;
		console.log("✓ PostgreSQL disconnected");
	}
}

/**
 * Get the current PostgreSQL database instance
 */
export function getPostgreSQL() {
	if (!db) {
		throw new Error(
			"PostgreSQL not connected. Call connectPostgreSQL() first.",
		);
	}
	return db;
}

// Test function when file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	console.log("Testing PostgreSQL connection...");

	// Test connection string - can be overridden via command line argument
	const testUrl = process.argv[2] || "postgresql://postgres:password@localhost:5432/test";
	console.log("Using test URL:", testUrl);

	connectPostgreSQL(testUrl)
		.then(async (db) => {
			console.log("PostgreSQL instance created:", !!db);
			await disconnectPostgreSQL();
			process.exit(0);
		})
		.catch((error) => {
			console.error("Test failed:", error);
			process.exit(1);
		});
}
