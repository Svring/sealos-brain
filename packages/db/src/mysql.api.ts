import type { MySql2Database } from "drizzle-orm/mysql2";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

let db: MySql2Database | null = null;
let connection: mysql.Connection | null = null;

/**
 * Connect to MySQL database using Drizzle ORM
 * @param connectionString MySQL connection string (defaults to MYSQL_URL env var)
 * @returns Drizzle database instance
 */
export async function connectMySQL(connectionString?: string) {
	const url =
		connectionString ||
		process.env.MYSQL_URL ||
		"mysql://root:password@localhost:3306/test";

	try {
		connection = await mysql.createConnection(url);
		db = drizzle(connection);

		// Test connection
		await connection.ping();
		console.log("✓ MySQL connected successfully");
		return db;
	} catch (error) {
		console.error("✗ MySQL connection failed:", error);
		throw error;
	}
}

/**
 * Disconnect from MySQL
 */
export async function disconnectMySQL() {
	if (connection) {
		await connection.end();
		connection = null;
		db = null;
		console.log("✓ MySQL disconnected");
	}
}

/**
 * Get the current MySQL database instance
 */
export function getMySQL() {
	if (!db) {
		throw new Error("MySQL not connected. Call connectMySQL() first.");
	}
	return db;
}

// Test function when file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	console.log("Testing MySQL connection...");

	// Test connection string - can be overridden via command line argument
	const testUrl = process.argv[2] || "mysql://root:password@localhost:3306/test";
	console.log("Using test URL:", testUrl);

	connectMySQL(testUrl)
		.then(async (db) => {
			console.log("MySQL instance created:", !!db);
			await disconnectMySQL();
			process.exit(0);
		})
		.catch((error) => {
			console.error("Test failed:", error);
			process.exit(1);
		});
}
