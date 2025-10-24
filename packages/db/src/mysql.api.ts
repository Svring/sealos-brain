import type { MySql2Database } from "drizzle-orm/mysql2";
import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import mysql from "mysql2/promise";

let db: MySql2Database | null = null;
let connection: mysql.Connection | null = null;

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
	orderDirection?: 'ASC' | 'DESC';
}

export interface ConnectionConfig {
	host?: string;
	port?: number;
	user?: string;
	password?: string;
	database?: string;
	connectionString?: string;
}

export class MySQLError extends Error {
	constructor(
		message: string,
		public operation: string,
		public originalError?: unknown
	) {
		super(message);
		this.name = 'MySQLError';
	}
}

function handleError(error: unknown, operation: string): never {
	const message = error instanceof Error ? error.message : 'Unknown error occurred';
	throw new MySQLError(`MySQL ${operation} failed: ${message}`, operation, error);
}

function getDatabase(): MySql2Database {
	if (!db) {
		throw new MySQLError(
			"MySQL not connected. Call connectMySQL() first.",
			"connection"
		);
	}
	return db;
}

function formatQueryResult(result: any[]): QueryResult {
	return {
		rows: result,
		rowCount: result.length,
		columns: result.length > 0 ? Object.keys(result[0]) : []
	};
}

function buildConnectionString(config: ConnectionConfig): string {
	if (config.connectionString) {
		return config.connectionString;
	}

	const host = config.host || 'localhost';
	const port = config.port || 3306;
	const user = config.user || 'root';
	const password = config.password || '';
	const database = config.database || 'test';

	return `mysql://${user}:${password}@${host}:${port}/${database}`;
}

/**
 * Connect to MySQL database using Drizzle ORM
 * @param config Connection configuration or connection string
 * @returns Drizzle database instance
 */
export async function connectMySQL(
	config?: string | ConnectionConfig
): Promise<MySql2Database> {
	try {
		let connectionString: string;

		if (typeof config === 'string') {
			connectionString = config;
		} else if (config) {
			connectionString = buildConnectionString(config);
		} else {
			connectionString = process.env.MYSQL_URL || "mysql://root:password@localhost:3306/test";
		}

		connection = await mysql.createConnection(connectionString);
		db = drizzle(connection);

		// Test connection
		await connection.ping();
		
		return db;
	} catch (error) {
		handleError(error, "connection");
	}
}

/**
 * Disconnect from MySQL
 */
export async function disconnectMySQL(): Promise<void> {
	if (connection) {
		await connection.end();
		connection = null;
		db = null;
	}
}

/**
 * Check if database is connected
 */
export function isConnected(): boolean {
	return db !== null && connection !== null;
}

/**
 * Get the current MySQL database instance
 */
export function getMySQL(): MySql2Database {
	return getDatabase();
}

/**
 * Get all tables in the database
 * @returns Array of table names
 */
export async function getTables(): Promise<string[]> {
  const database = getDatabase();
  try {
    const result = await (database as any).$client.execute("SHOW TABLES");
    return result.map((row: any) => {
      const keys = Object.keys(row);
      return keys[0] ? String(row[keys[0]]) : '';
    }).filter((name: string) => name !== '');
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
  params: any[] = []
): Promise<QueryResult> {
  const database = getDatabase();

  try {
    if (!sqlQuery || sqlQuery.trim() === '') {
      throw new Error('SQL query is required');
    }

    const result = await (database as any).$client.execute(
      sqlQuery,
      params || []
    );
    return formatQueryResult(result);
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
    if (!options.tableName || options.tableName.trim() === '') {
      throw new Error('Table name is required');
    }

    // Validate order direction
    const orderDirection = options.orderDirection || 'ASC';
    if (orderDirection !== 'ASC' && orderDirection !== 'DESC') {
      throw new Error('Order direction must be ASC or DESC');
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
    return formatQueryResult(result);
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
  data: Record<string, any>
): Promise<number> {
  const database = getDatabase();

  try {
    if (!tableName || tableName.trim() === '') {
      throw new Error('Table name is required');
    }
    if (!data || typeof data !== 'object') {
      throw new Error('Data must be an object');
    }

    const columns = Object.keys(data);
    const values = Object.values(data) as any[];

    if (columns.length === 0) {
      throw new Error("No data to insert");
    }

    const columnNames = columns.map(col => `\`${col}\``).join(', ');
    const placeholders = values.map(() => '?').join(', ');
    const sqlQuery = `INSERT INTO \`${tableName}\` (${columnNames}) VALUES (${placeholders})`;

    const result = await (database as any).$client.execute(sqlQuery, values);
    return (result as any).affectedRows || 1;
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
  data: Record<string, any>[]
): Promise<number> {
  const database = getDatabase();

  try {
    if (!tableName || tableName.trim() === '') {
      throw new Error('Table name is required');
    }
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    if (data.length === 0) {
      throw new Error("No data to insert");
    }

    const columns = Object.keys(data[0] || {});
    if (columns.length === 0) {
      throw new Error("Data objects must have at least one property");
    }

    const columnNames = columns.map(col => `\`${col}\``).join(', ');
    const placeholders = data.map(() => 
      `(${columns.map(() => '?').join(', ')})`
    ).join(', ');

    const values = data.flatMap(row => columns.map(col => row[col]));
    const sqlQuery = `INSERT INTO \`${tableName}\` (${columnNames}) VALUES ${placeholders}`;

    const result = await (database as any).$client.execute(sqlQuery, values);
    return (result as any).affectedRows || data.length;
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
  data: Record<string, any>
): Promise<number> {
  const database = getDatabase();

  try {
    if (!tableName || tableName.trim() === '') {
      throw new Error('Table name is required');
    }
    if (!where || where.trim() === '') {
      throw new Error('WHERE clause is required');
    }
    if (!data || typeof data !== 'object') {
      throw new Error('Data must be an object');
    }

    const updateEntries = Object.entries(data);
    if (updateEntries.length === 0) {
      throw new Error("No data to update");
    }

    const setClause = updateEntries.map(([col, _]) => `\`${col}\` = ?`).join(', ');
    const values = Object.values(data) as any[];
    const sqlQuery = `UPDATE \`${tableName}\` SET ${setClause} WHERE ${where}`;

    const result = await (database as any).$client.execute(sqlQuery, values);
    return (result as any).affectedRows || 0;
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
  where: string
): Promise<number> {
  const database = getDatabase();

  try {
    if (!tableName || tableName.trim() === '') {
      throw new Error('Table name is required');
    }
    if (!where || where.trim() === '') {
      throw new Error('WHERE clause is required');
    }

    const query = sql`
      DELETE FROM ${sql.identifier(tableName)}
      WHERE ${sql.raw(where)}
    `;

    const result = await database.execute(query);
    return (result as any).affectedRows || 0;
  } catch (error) {
    handleError(error, "executing delete");
  }
}

// Export default object with all functions
export default {
  connectMySQL,
  disconnectMySQL,
  isConnected,
  getMySQL,
  getTables,
  query,
  select,
  insert,
  insertMany,
  update,
  deleteFrom,
  MySQLError
};
