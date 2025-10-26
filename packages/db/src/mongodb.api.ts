import mongoose from "mongoose";

export interface MongoQueryResult {
	documents: any[];
	count: number;
	hasMore: boolean;
}

export interface MongoInsertResult {
	insertedId: mongoose.Types.ObjectId | mongoose.Types.ObjectId[];
	acknowledged: boolean;
	insertedCount: number;
}

export interface MongoUpdateResult {
	matchedCount: number;
	modifiedCount: number;
	upsertedCount: number;
	upsertedId?: mongoose.Types.ObjectId;
	acknowledged: boolean;
}

export interface MongoDeleteResult {
	deletedCount: number;
	acknowledged: boolean;
}

export interface MongoQueryOptions {
	limit?: number;
	skip?: number;
	sort?: Record<string, 1 | -1>;
	projection?: Record<string, 1 | 0>;
}

export interface MongoConnectionConfig {
	host?: string;
	port?: number;
	database?: string;
	username?: string;
	password?: string;
	authSource?: string;
	replicaSet?: string;
	ssl?: boolean;
	connectionString?: string;
	options?: mongoose.ConnectOptions;
}

export class MongoDBError extends Error {
	constructor(
		message: string,
		public operation: string,
		public originalError?: unknown,
	) {
		super(message);
		this.name = "MongoDBError";
	}
}

function handleError(error: unknown, operation: string): never {
	const message =
		error instanceof Error ? error.message : "Unknown error occurred";
	throw new MongoDBError(
		`MongoDB ${operation} failed: ${message}`,
		operation,
		error,
	);
}

function buildConnectionString(config: MongoConnectionConfig): string {
	if (config.connectionString) {
		return config.connectionString;
	}

	const host = config.host || "localhost";
	const port = config.port || 27017;
	const database = config.database || "test";
	const username = config.username;
	const password = config.password;
	const authSource = config.authSource;
	const replicaSet = config.replicaSet;
	const ssl = config.ssl;

	let uri = "mongodb://";

	if (username && password) {
		uri += `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
	}

	uri += `${host}:${port}/${database}`;

	const params: string[] = [];
	if (authSource) params.push(`authSource=${authSource}`);
	if (replicaSet) params.push(`replicaSet=${replicaSet}`);
	if (ssl) params.push("ssl=true");

	if (params.length > 0) {
		uri += "?" + params.join("&");
	}

	console.log(
		`Built connection string: ${uri.replace(/\/\/[^@]*@/, "//***:***@")}`,
	);
	return uri;
}

/**
 * Connect to MongoDB database
 * @param config Connection configuration or connection string
 * @returns Mongoose connection instance
 */
export async function connectMongoDB(
	config?: string | MongoConnectionConfig,
): Promise<mongoose.Connection> {
	try {
		let connectionString: string;
		let options: mongoose.ConnectOptions = {};

		if (typeof config === "string") {
			connectionString = config;
		} else if (config) {
			connectionString = buildConnectionString(config);
			if (config.options) {
				options = config.options;
			}
		} else {
			connectionString =
				process.env.MONGODB_URI || "mongodb://localhost:27017/test";
		}

		await mongoose.connect(connectionString, options);
		return mongoose.connection;
	} catch (error) {
		handleError(error, "connection");
	}
}

export async function disconnectMongoDB(): Promise<void> {
	await mongoose.disconnect();
}

export function isConnected(): boolean {
	return mongoose.connection.readyState === 1;
}

export function getMongoDB(): mongoose.Connection {
	if (mongoose.connection.readyState !== 1) {
		throw new MongoDBError(
			"MongoDB not connected. Call connectMongoDB() first.",
			"connection",
		);
	}
	return mongoose.connection;
}

/**
 * Get all collections in the database
 * @returns Array of collection names
 */
export async function getCollections(): Promise<string[]> {
	const db = getMongoDB();
	try {
		const collections = (await db.db?.listCollections().toArray()) || [];
		return collections.map((col: any) => col.name);
	} catch (error) {
		handleError(error, "fetching collections");
	}
}

/**
 * Find documents in a collection
 * @param collectionName Name of the collection
 * @param query Query filter
 * @param options Query options (limit, skip, sort, projection)
 * @returns Query result with documents and metadata
 */
export async function find(
	collectionName: string,
	query: Record<string, any> = {},
	options: MongoQueryOptions = {},
): Promise<MongoQueryResult> {
	const db = getMongoDB();

	try {
		if (!collectionName || collectionName.trim() === "") {
			throw new Error("Collection name is required");
		}

		const collection = db.db?.collection(collectionName);
		if (!collection) {
			throw new Error(`Collection ${collectionName} not found`);
		}

		let cursor = collection.find(query);

		// Apply options
		if (options.sort) {
			cursor = cursor.sort(options.sort as any);
		}
		if (options.skip) {
			cursor = cursor.skip(options.skip);
		}
		if (options.limit) {
			cursor = cursor.limit(options.limit);
		}
		if (options.projection) {
			cursor = cursor.project(options.projection);
		}

		const documents = await cursor.toArray();

		// Check if there are more documents
		const hasMore = options.limit
			? (await collection.countDocuments(query)) >
				(options.skip || 0) + documents.length
			: false;

		return {
			documents,
			count: documents.length,
			hasMore,
		};
	} catch (error) {
		handleError(error, "executing find");
	}
}

/**
 * Find a single document
 * @param collectionName Name of the collection
 * @param query Query filter
 * @param options Query options (projection)
 * @returns Single document or null
 */
export async function findOne(
	collectionName: string,
	query: Record<string, any> = {},
	options: { projection?: Record<string, 1 | 0> } = {},
): Promise<any | null> {
	const db = getMongoDB();

	try {
		if (!collectionName || collectionName.trim() === "") {
			throw new Error("Collection name is required");
		}

		const collection = db.db?.collection(collectionName);
		if (!collection) {
			throw new Error(`Collection ${collectionName} not found`);
		}

		const document = await collection.findOne(query, {
			projection: options.projection,
		});

		return document;
	} catch (error) {
		handleError(error, "executing findOne");
	}
}

/**
 * Count documents in a collection
 * @param collectionName Name of the collection
 * @param query Query filter
 * @returns Number of documents matching the query
 */
export async function count(
	collectionName: string,
	query: Record<string, any> = {},
): Promise<number> {
	const db = getMongoDB();

	try {
		if (!collectionName || collectionName.trim() === "") {
			throw new Error("Collection name is required");
		}

		const collection = db.db?.collection(collectionName);
		if (!collection) {
			throw new Error(`Collection ${collectionName} not found`);
		}

		return await collection.countDocuments(query);
	} catch (error) {
		handleError(error, "executing count");
	}
}

/**
 * Insert a single document
 * @param collectionName Name of the collection
 * @param document Document to insert
 * @returns Insert result
 */
export async function insertOne(
	collectionName: string,
	document: Record<string, any>,
): Promise<MongoInsertResult> {
	const db = getMongoDB();

	try {
		if (!collectionName || collectionName.trim() === "") {
			throw new Error("Collection name is required");
		}
		if (!document || typeof document !== "object") {
			throw new Error("Document must be an object");
		}

		const collection = db.db?.collection(collectionName);
		if (!collection) {
			throw new Error(`Collection ${collectionName} not found`);
		}

		const result = await collection.insertOne(document);

		return {
			insertedId: result.insertedId as mongoose.Types.ObjectId,
			acknowledged: result.acknowledged,
			insertedCount: 1,
		};
	} catch (error) {
		handleError(error, "executing insertOne");
	}
}

/**
 * Insert multiple documents
 * @param collectionName Name of the collection
 * @param documents Array of documents to insert
 * @returns Insert result
 */
export async function insertMany(
	collectionName: string,
	documents: Record<string, any>[],
): Promise<MongoInsertResult> {
	const db = getMongoDB();

	try {
		if (!collectionName || collectionName.trim() === "") {
			throw new Error("Collection name is required");
		}
		if (!Array.isArray(documents)) {
			throw new Error("Documents must be an array");
		}
		if (documents.length === 0) {
			throw new Error("No documents to insert");
		}

		const collection = db.db?.collection(collectionName);
		if (!collection) {
			throw new Error(`Collection ${collectionName} not found`);
		}

		const result = await collection.insertMany(documents);

		return {
			insertedId: Object.values(
				result.insertedIds,
			) as mongoose.Types.ObjectId[],
			acknowledged: result.acknowledged,
			insertedCount: result.insertedCount,
		};
	} catch (error) {
		handleError(error, "executing insertMany");
	}
}

/**
 * Update a single document
 * @param collectionName Name of the collection
 * @param filter Filter to find document
 * @param update Update operations
 * @param options Update options
 * @returns Update result
 */
export async function updateOne(
	collectionName: string,
	filter: Record<string, any>,
	update: Record<string, any>,
	options: { upsert?: boolean } = {},
): Promise<MongoUpdateResult> {
	const db = getMongoDB();

	try {
		if (!collectionName || collectionName.trim() === "") {
			throw new Error("Collection name is required");
		}
		if (!filter || typeof filter !== "object") {
			throw new Error("Filter must be an object");
		}
		if (!update || typeof update !== "object") {
			throw new Error("Update must be an object");
		}

		const collection = db.db?.collection(collectionName);
		if (!collection) {
			throw new Error(`Collection ${collectionName} not found`);
		}

		const result = await collection.updateOne(filter, update, options);

		return {
			matchedCount: result.matchedCount,
			modifiedCount: result.modifiedCount,
			upsertedCount: result.upsertedCount,
			upsertedId: result.upsertedId as mongoose.Types.ObjectId | undefined,
			acknowledged: result.acknowledged,
		};
	} catch (error) {
		handleError(error, "executing updateOne");
	}
}

/**
 * Update multiple documents
 * @param collectionName Name of the collection
 * @param filter Filter to find documents
 * @param update Update operations
 * @param options Update options
 * @returns Update result
 */
export async function updateMany(
	collectionName: string,
	filter: Record<string, any>,
	update: Record<string, any>,
	options: { upsert?: boolean } = {},
): Promise<MongoUpdateResult> {
	const db = getMongoDB();

	try {
		if (!collectionName || collectionName.trim() === "") {
			throw new Error("Collection name is required");
		}
		if (!filter || typeof filter !== "object") {
			throw new Error("Filter must be an object");
		}
		if (!update || typeof update !== "object") {
			throw new Error("Update must be an object");
		}

		const collection = db.db?.collection(collectionName);
		if (!collection) {
			throw new Error(`Collection ${collectionName} not found`);
		}

		const result = await collection.updateMany(filter, update, options);

		return {
			matchedCount: result.matchedCount,
			modifiedCount: result.modifiedCount,
			upsertedCount: result.upsertedCount,
			upsertedId: result.upsertedId as mongoose.Types.ObjectId | undefined,
			acknowledged: result.acknowledged,
		};
	} catch (error) {
		handleError(error, "executing updateMany");
	}
}

/**
 * Delete a single document
 * @param collectionName Name of the collection
 * @param filter Filter to find document
 * @returns Delete result
 */
export async function deleteOne(
	collectionName: string,
	filter: Record<string, any>,
): Promise<MongoDeleteResult> {
	const db = getMongoDB();

	try {
		if (!collectionName || collectionName.trim() === "") {
			throw new Error("Collection name is required");
		}
		if (!filter || typeof filter !== "object") {
			throw new Error("Filter must be an object");
		}

		const collection = db.db?.collection(collectionName);
		if (!collection) {
			throw new Error(`Collection ${collectionName} not found`);
		}

		const result = await collection.deleteOne(filter);

		return {
			deletedCount: result.deletedCount,
			acknowledged: result.acknowledged,
		};
	} catch (error) {
		handleError(error, "executing deleteOne");
	}
}

/**
 * Delete multiple documents
 * @param collectionName Name of the collection
 * @param filter Filter to find documents
 * @returns Delete result
 */
export async function deleteMany(
	collectionName: string,
	filter: Record<string, any>,
): Promise<MongoDeleteResult> {
	const db = getMongoDB();

	try {
		if (!collectionName || collectionName.trim() === "") {
			throw new Error("Collection name is required");
		}
		if (!filter || typeof filter !== "object") {
			throw new Error("Filter must be an object");
		}

		const collection = db.db?.collection(collectionName);
		if (!collection) {
			throw new Error(`Collection ${collectionName} not found`);
		}

		const result = await collection.deleteMany(filter);

		return {
			deletedCount: result.deletedCount,
			acknowledged: result.acknowledged,
		};
	} catch (error) {
		handleError(error, "executing deleteMany");
	}
}

export default {
	connectMongoDB,
	disconnectMongoDB,
	isConnected,
	getMongoDB,
	getCollections,
	find,
	findOne,
	count,
	insertOne,
	insertMany,
	updateOne,
	updateMany,
	deleteOne,
	deleteMany,
	MongoDBError,
};
