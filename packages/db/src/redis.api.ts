import Redis, { RedisOptions } from "ioredis";

let redis: Redis | null = null;

export interface RedisScanOptions {
	pattern?: string;
	count?: number;
	cursor?: string;
}

export interface RedisConnectionConfig {
	host?: string;
	port?: number;
	password?: string;
	db?: number;
	username?: string;
	family?: 4 | 6;
	connectionString?: string;
	options?: RedisOptions;
}

export class RedisError extends Error {
	constructor(
		message: string,
		public operation: string,
		public originalError?: unknown
	) {
		super(message);
		this.name = 'RedisError';
	}
}

function handleError(error: unknown, operation: string): never {
	const message = error instanceof Error ? error.message : 'Unknown error occurred';
	throw new RedisError(`Redis ${operation} failed: ${message}`, operation, error);
}

function getClient(): Redis {
	if (!redis) {
		throw new RedisError(
			"Redis not connected. Call connectRedis() first.",
			"connection"
		);
	}
	return redis;
}

/**
 * Connect to Redis database
 * @param config Connection configuration or connection string
 * @returns Redis client instance
 */
export function connectRedis(
	config?: string | RedisConnectionConfig
): Redis {
	try {
		let options: RedisOptions;

		if (typeof config === 'string') {
			const urlObj = new URL(config);
			options = {
				host: urlObj.hostname,
				port: parseInt(urlObj.port) || 6379,
				password: urlObj.password || undefined,
				db: parseInt(urlObj.pathname.slice(1)) || 0
			};
		} else if (config) {
			if (config.connectionString) {
				const urlObj = new URL(config.connectionString);
				options = {
					host: urlObj.hostname,
					port: parseInt(urlObj.port) || 6379,
					password: urlObj.password || undefined,
					db: parseInt(urlObj.pathname.slice(1)) || 0
				};
			} else {
				options = {
					host: config.host || 'localhost',
					port: config.port || 6379,
					db: config.db || 0,
					...config.options
				};

				if (config.password) {
					options.password = config.password;
				}
				if (config.username) {
					options.username = config.username;
				}
				if (config.family) {
					options.family = config.family;
				}
			}
		} else {
			const url = process.env.REDIS_URL || "redis://localhost:6379";
			const urlObj = new URL(url);
			options = {
				host: urlObj.hostname,
				port: parseInt(urlObj.port) || 6379,
				password: urlObj.password || undefined,
				db: parseInt(urlObj.pathname.slice(1)) || 0
			};
		}

		redis = new Redis(options);

		redis.on("error", () => {
		});

		return redis;
	} catch (error) {
		handleError(error, "connection");
	}
}

export async function disconnectRedis(): Promise<void> {
	if (redis) {
		await redis.quit();
		redis = null;
	}
}

export function isConnected(): boolean {
	return redis !== null && redis.status === 'ready';
}

export function getRedis(): Redis {
	return getClient();
}

/**
 * Get all keys matching a pattern
 * @param options Scan options with pattern
 * @returns Array of keys
 */
export async function getKeys(options: RedisScanOptions = {}): Promise<string[]> {
  const client = getClient();
  try {
    const pattern = options.pattern || '*';
    const keys = await client.keys(pattern);
    return keys;
  } catch (error) {
    handleError(error, "getting keys");
  }
}

/**
 * Scan keys with cursor-based iteration (recommended for large datasets)
 * @param options Scan options
 * @returns Object with cursor and keys
 */
export async function scanKeys(
  options: RedisScanOptions = {}
): Promise<{ cursor: string; keys: string[] }> {
  const client = getClient();
  try {
    const cursor = options.cursor || '0';
    const count = options.count || 100;
    const pattern = options.pattern || '*';

    const [newCursor, keys] = await client.scan(
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      count
    );

    return {
      cursor: newCursor,
      keys
    };
  } catch (error) {
    handleError(error, "scanning keys");
  }
}

/**
 * Get value of a string key
 * @param key Redis key
 * @returns String value or null
 */
export async function getString(key: string): Promise<string | null> {
  const client = getClient();
  try {
    if (!key || key.trim() === '') {
      throw new Error('Key is required');
    }
    return await client.get(key);
  } catch (error) {
    handleError(error, "getting string");
  }
}

/**
 * Set value of a string key
 * @param key Redis key
 * @param value String value
 * @param ttl Optional TTL in seconds
 * @returns Success status
 */
export async function setString(
  key: string,
  value: string,
  ttl?: number
): Promise<boolean> {
  const client = getClient();
  try {
    if (!key || key.trim() === '') {
      throw new Error('Key is required');
    }
    if (value === undefined || value === null) {
      throw new Error('Value is required');
    }

    let result: string | 'OK' | null;

    if (ttl !== undefined && ttl > 0) {
      result = await client.setex(key, ttl, value);
    } else {
      result = await client.set(key, value);
    }

    return result === 'OK';
  } catch (error) {
    handleError(error, "setting string");
  }
}

/**
 * Delete one or more keys
 * @param keys Redis key or array of keys
 * @returns Number of keys deleted
 */
export async function deleteKey(keys: string | string[]): Promise<number> {
  const client = getClient();
  try {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    
    if (keyArray.length === 0) {
      throw new Error('At least one key is required');
    }
    
    keyArray.forEach(k => {
      if (!k || k.trim() === '') {
        throw new Error('Key cannot be empty');
      }
    });
    
    const result = await client.del(...keyArray);
    return result;
  } catch (error) {
    handleError(error, "deleting key");
  }
}

/**
 * Get TTL (time to live) of a key
 * @param key Redis key
 * @returns TTL in seconds, -1 if no TTL, -2 if key doesn't exist
 */
export async function getTTL(key: string): Promise<number> {
  const client = getClient();
  try {
    if (!key || key.trim() === '') {
      throw new Error('Key is required');
    }
    const ttl = await client.ttl(key);
    return ttl;
  } catch (error) {
    handleError(error, "getting TTL");
  }
}

/**
 * Set TTL (time to live) of a key
 * @param key Redis key
 * @param ttl TTL in seconds
 * @returns Success status
 */
export async function setTTL(key: string, ttl: number): Promise<boolean> {
  const client = getClient();
  try {
    if (!key || key.trim() === '') {
      throw new Error('Key is required');
    }
    if (ttl < 0) {
      throw new Error('TTL must be non-negative');
    }
    const result = await client.expire(key, ttl);
    return result === 1;
  } catch (error) {
    handleError(error, "setting TTL");
  }
}

/**
 * Check if key exists
 * @param key Redis key
 * @returns True if key exists
 */
export async function exists(key: string): Promise<boolean> {
  const client = getClient();
  try {
    if (!key || key.trim() === '') {
      throw new Error('Key is required');
    }
    const result = await client.exists(key);
    return result === 1;
  } catch (error) {
    handleError(error, "checking key existence");
  }
}

/**
 * Get multiple values at once
 * @param keys Array of keys
 * @returns Array of values (null for non-existent keys)
 */
export async function getMultiple(keys: string[]): Promise<(string | null)[]> {
  const client = getClient();
  try {
    if (!Array.isArray(keys) || keys.length === 0) {
      throw new Error('Keys must be a non-empty array');
    }
    
    keys.forEach(k => {
      if (!k || k.trim() === '') {
        throw new Error('Key cannot be empty');
      }
    });
    
    return await client.mget(...keys);
  } catch (error) {
    handleError(error, "getting multiple values");
  }
}

/**
 * Set multiple values at once
 * @param keyValues Object with key-value pairs
 * @returns Success status
 */
export async function setMultiple(keyValues: Record<string, string>): Promise<boolean> {
  const client = getClient();
  try {
    if (!keyValues || typeof keyValues !== 'object') {
      throw new Error('Key-value pairs must be an object');
    }
    
    const entries = Object.entries(keyValues);
    if (entries.length === 0) {
      throw new Error('At least one key-value pair is required');
    }
    
    const flatArray: string[] = [];
    entries.forEach(([key, value]) => {
      if (!key || key.trim() === '') {
        throw new Error('Key cannot be empty');
      }
      if (value === undefined || value === null) {
        throw new Error('Value cannot be undefined or null');
      }
      flatArray.push(key, value);
    });
    
    const result = await client.mset(...flatArray);
    return result === 'OK';
  } catch (error) {
    handleError(error, "setting multiple values");
  }
}

/**
 * Execute a pipeline of commands
 * @param commands Array of command arrays [command, ...args]
 * @returns Results of all commands
 */
export async function executePipeline(
  commands: Array<[command: string, ...args: any[]]>
): Promise<any[]> {
  const client = getClient();
  try {
    if (!Array.isArray(commands) || commands.length === 0) {
      throw new Error('Commands must be a non-empty array');
    }
    
    const pipeline = client.pipeline();
    commands.forEach(([command, ...args]) => {
      if (!command || typeof command !== 'string') {
        throw new Error('Command must be a string');
      }
      (pipeline as any)[command](...args);
    });
    
    const results = await pipeline.exec();
    return results?.map(([err, result]) => {
      if (err) throw err;
      return result;
    }) || [];
  } catch (error) {
    handleError(error, "executing pipeline");
  }
}

/**
 * Execute a transaction (MULTI/EXEC)
 * @param commands Array of command arrays [command, ...args]
 * @returns Results of all commands
 */
export async function executeTransaction(
  commands: Array<[command: string, ...args: any[]]>
): Promise<any[]> {
  const client = getClient();
  try {
    if (!Array.isArray(commands) || commands.length === 0) {
      throw new Error('Commands must be a non-empty array');
    }
    
    const multi = client.multi();
    commands.forEach(([command, ...args]) => {
      if (!command || typeof command !== 'string') {
        throw new Error('Command must be a string');
      }
      (multi as any)[command](...args);
    });
    
    const results = await multi.exec();
    return results?.map(([err, result]) => {
      if (err) throw err;
      return result;
    }) || [];
  } catch (error) {
    handleError(error, "executing transaction");
  }
}

// Export default object with all functions
export default {
  connectRedis,
  disconnectRedis,
  isConnected,
  getRedis,
  getKeys,
  scanKeys,
  getString,
  setString,
  deleteKey,
  getTTL,
  setTTL,
  exists,
  getMultiple,
  setMultiple,
  executePipeline,
  executeTransaction,
  RedisError
};
