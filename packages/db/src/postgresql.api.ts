import { sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let db: PostgresJsDatabase | null = null;
let client: postgres.Sql | null = null;

export interface QueryResult {
	rows: any[];
	rowCount: number;
	columns: string[];
}

export interface SelectOptions {
	tableName: string;
	where?: string;
	limit?: number;
	offset?: number;
	orderBy?: string;
	orderDirection?: "ASC" | "DESC";
}

export interface ConnectionConfig {
	host?: string;
	port?: number;
	user?: string;
	password?: string;
	database?: string;
	ssl?: boolean | "require" | "prefer";
	connectionString?: string;
	options?: postgres.Options<any>;
}

export class PostgreSQLError extends Error {
	constructor(
		message: string,
		public operation: string,
		public originalError?: unknown,
	) {
		super(message);
		this.name = "PostgreSQLError";
	}
}

function handleError(error: unknown, operation: string): never {
	const message =
		error instanceof Error ? error.message : "Unknown error occurred";
	throw new PostgreSQLError(
		`PostgreSQL ${operation} failed: ${message}`,
		operation,
		error,
	);
}

function getDatabase(): PostgresJsDatabase {
	if (!db) {
		throw new PostgreSQLError(
			"PostgreSQL not connected. Call connectPostgreSQL() first.",
			"connection",
		);
	}
	return db;
}

function buildConnectionString(config: ConnectionConfig): string {
	if (config.connectionString) {
		return config.connectionString;
	}

	const host = config.host || "localhost";
	const port = config.port || 5432;
	const user = config.user || "postgres";
	const password = config.password || "";
	const database = config.database || "postgres";

	return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

/**
 * Connect to PostgreSQL database using Drizzle ORM
 * @param config Connection configuration or connection string
 * @returns Drizzle database instance
 */
export async function connectPostgreSQL(
	config?: string | ConnectionConfig,
): Promise<PostgresJsDatabase> {
	try {
		let connectionString: string;
		let options: postgres.Options<any> = {};

		if (typeof config === "string") {
			connectionString = config;
		} else if (config) {
			connectionString = buildConnectionString(config);
			if (config.ssl) {
				options.ssl = config.ssl;
			}
			if (config.options) {
				options = { ...options, ...config.options };
			}
		} else {
			connectionString =
				process.env.POSTGRESQL_URL ||
				"postgresql://postgres:password@localhost:5432/postgres";
		}

		client = postgres(connectionString, options);
		db = drizzle(client);

		// Test connection
		await client`SELECT 1`;

		return db;
	} catch (error) {
		handleError(error, "connection");
	}
}

/**
 * Disconnect from PostgreSQL
 */
export async function disconnectPostgreSQL(): Promise<void> {
	if (client) {
		await client.end();
		client = null;
		db = null;
	}
}

/**
 * Check if database is connected
 */
export function isConnected(): boolean {
	return db !== null && client !== null;
}

/**
 * Get the current PostgreSQL database instance
 */
export function getPostgreSQL(): PostgresJsDatabase {
	return getDatabase();
}

/**
 * Get all tables in the database
 * @returns Array of table names
 */
export async function getTables(): Promise<string[]> {
	const database = getDatabase();
	try {
		const result = await database.execute(
			sql`SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name`,
		);
		return result.map((row: any) => row.table_name);
	} catch (error) {
		handleError(error, "fetching tables");
	}
}

/**
 * Execute raw SQL query
 * @param sqlQuery SQL query string
 * @param params Optional parameters
 * @returns Query result
 */
export async function query(
	sqlQuery: string,
	params: any[] = [],
): Promise<QueryResult> {
	const database = getDatabase();

	try {
		if (!sqlQuery || sqlQuery.trim() === "") {
			throw new Error("SQL query is required");
		}

		const result = await (database as any).$client.unsafe(
			sqlQuery,
			params || [],
		);

		const columns =
			result.length > 0 && result[0] ? Object.keys(result[0]) : [];

		return {
			rows: result,
			rowCount: result.length,
			columns,
		};
	} catch (error) {
		handleError(error, "executing query");
	}
}

/**
 * Select data from a table with optional filtering
 * @param options Select options
 * @returns Query result
 */
export async function select(options: SelectOptions): Promise<QueryResult> {
	const database = getDatabase();

	try {
		if (!options.tableName || options.tableName.trim() === "") {
			throw new Error("Table name is required");
		}

		const orderDirection = options.orderDirection || "ASC";
		if (orderDirection !== "ASC" && orderDirection !== "DESC") {
			throw new Error("Order direction must be ASC or DESC");
		}

		let query = sql`SELECT * FROM ${sql.identifier(options.tableName)}`;

		if (options.where) {
			query = sql`${query} WHERE ${sql.raw(options.where)}`;
		}

		if (options.orderBy) {
			query = sql`${query} ORDER BY ${sql.identifier(options.orderBy)} ${sql.raw(orderDirection)}`;
		}

		if (options.limit) {
			query = sql`${query} LIMIT ${options.limit}`;
		}

		if (options.offset) {
			query = sql`${query} OFFSET ${options.offset}`;
		}

		const result = await database.execute(query);
		const columns =
			result.length > 0 && result[0] ? Object.keys(result[0]) : [];

		return {
			rows: result,
			rowCount: result.length,
			columns,
		};
	} catch (error) {
		handleError(error, "executing select");
	}
}

/**
 * Insert data into a table
 * @param tableName Target table name
 * @param data Object containing column-value pairs
 * @returns Number of affected rows
 */
export async function insert(
	tableName: string,
	data: Record<string, any>,
): Promise<number> {
	const database = getDatabase();

	try {
		if (!tableName || tableName.trim() === "") {
			throw new Error("Table name is required");
		}
		if (!data || typeof data !== "object") {
			throw new Error("Data must be an object");
		}

		const columns = Object.keys(data);
		const values = Object.values(data) as any[];

		if (columns.length === 0) {
			throw new Error("No data to insert");
		}

		const columnNames = columns.map((col) => `"${col}"`).join(", ");
		const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
		const sqlQuery = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders})`;

		await (database as any).$client.unsafe(sqlQuery, values);
		return 1;
	} catch (error) {
		handleError(error, "executing insert");
	}
}

/**
 * Insert multiple rows into a table
 * @param tableName Target table name
 * @param data Array of objects containing column-value pairs
 * @returns Number of affected rows
 */
export async function insertMany(
	tableName: string,
	data: Record<string, any>[],
): Promise<number> {
	const database = getDatabase();

	try {
		if (!tableName || tableName.trim() === "") {
			throw new Error("Table name is required");
		}
		if (!Array.isArray(data)) {
			throw new Error("Data must be an array");
		}
		if (data.length === 0) {
			throw new Error("No data to insert");
		}

		const columns = Object.keys(data[0] || {});
		if (columns.length === 0) {
			throw new Error("Data objects must have at least one property");
		}

		const columnNames = columns.map((col) => `"${col}"`).join(", ");

		const values: any[] = [];
		const placeholderRows: string[] = [];

		data.forEach((row, rowIndex) => {
			const rowPlaceholders = columns.map((col, colIndex) => {
				values.push(row[col]);
				return `$${rowIndex * columns.length + colIndex + 1}`;
			});
			placeholderRows.push(`(${rowPlaceholders.join(", ")})`);
		});

		const sqlQuery = `INSERT INTO "${tableName}" (${columnNames}) VALUES ${placeholderRows.join(", ")}`;

		await (database as any).$client.unsafe(sqlQuery, values);
		return data.length;
	} catch (error) {
		handleError(error, "executing batch insert");
	}
}

/**
 * Update data in a table
 * @param tableName Target table name
 * @param where WHERE clause condition
 * @param data Object containing column-value pairs to update
 * @returns Number of affected rows
 */
export async function update(
	tableName: string,
	where: string,
	data: Record<string, any>,
): Promise<number> {
	const database = getDatabase();

	try {
		if (!tableName || tableName.trim() === "") {
			throw new Error("Table name is required");
		}
		if (!where || where.trim() === "") {
			throw new Error("WHERE clause is required");
		}
		if (!data || typeof data !== "object") {
			throw new Error("Data must be an object");
		}

		const updateEntries = Object.entries(data);
		if (updateEntries.length === 0) {
			throw new Error("No data to update");
		}

		const setClause = updateEntries
			.map(([col, _], i) => `"${col}" = $${i + 1}`)
			.join(", ");
		const values = Object.values(data) as any[];
		const sqlQuery = `UPDATE "${tableName}" SET ${setClause} WHERE ${where}`;

		const result = await (database as any).$client.unsafe(sqlQuery, values);
		return result.count || 0;
	} catch (error) {
		handleError(error, "executing update");
	}
}

/**
 * Delete data from a table
 * @param tableName Target table name
 * @param where WHERE clause condition
 * @returns Number of affected rows
 */
export async function deleteFrom(
	tableName: string,
	where: string,
): Promise<number> {
	const database = getDatabase();

	try {
		if (!tableName || tableName.trim() === "") {
			throw new Error("Table name is required");
		}
		if (!where || where.trim() === "") {
			throw new Error("WHERE clause is required");
		}

		const query = sql`
      DELETE FROM ${sql.identifier(tableName)}
      WHERE ${sql.raw(where)}
    `;

		const result = await database.execute(query);
		return (result as any).rowCount || 0;
	} catch (error) {
		handleError(error, "executing delete");
	}
}

/**
 * Execute a transaction with multiple operations
 * @param callback Transaction callback function
 * @returns Result from the callback
 */
export async function transaction<T>(
	callback: (tx: postgres.Sql) => Promise<T>,
): Promise<T> {
	if (!client) {
		throw new PostgreSQLError(
			"PostgreSQL not connected. Call connectPostgreSQL() first.",
			"transaction",
		);
	}

	try {
		return (await client.begin(async (tx) => {
			return await callback(tx);
		})) as T;
	} catch (error) {
		handleError(error, "executing transaction");
	}
}

export default {
	connectPostgreSQL,
	disconnectPostgreSQL,
	isConnected,
	getPostgreSQL,
	getTables,
	query,
	select,
	insert,
	insertMany,
	update,
	deleteFrom,
	transaction,
	PostgreSQLError,
};
