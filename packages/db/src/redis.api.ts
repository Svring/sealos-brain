import Redis from 'ioredis';

let redis: Redis | null = null;

/**
 * Connect to Redis database
 * @param connectionString Redis connection string (defaults to REDIS_URL env var)
 * @returns Redis client instance
 */
export function connectRedis(connectionString?: string) {
  const url = connectionString || process.env.REDIS_URL || 'redis://localhost:6379';
  
  try {
    redis = new Redis(url);
    
    redis.on('connect', () => {
      console.log('✓ Redis connected successfully');
    });
    
    redis.on('error', (error) => {
      console.error('✗ Redis connection error:', error);
    });
    
    return redis;
  } catch (error) {
    console.error('✗ Redis connection failed:', error);
    throw error;
  }
}

/**
 * Disconnect from Redis
 */
export async function disconnectRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log('✓ Redis disconnected');
  }
}

/**
 * Get the current Redis client instance
 */
export function getRedis() {
  if (!redis) {
    throw new Error('Redis not connected. Call connectRedis() first.');
  }
  return redis;
}

// Test function when file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Testing Redis connection...');
  
  // Test connection string - can be overridden via command line argument
  const testUrl = process.argv[2] || 'redis://default:khbrgm5q@usw.sealos.io:42488';
  console.log('Using test URL:', testUrl);
  
  const client = connectRedis(testUrl);
  
  // Wait for connection to establish
  client.on('connect', async () => {
    try {
      // Test ping
      const result = await client.ping();
      console.log('Ping result:', result);
      await disconnectRedis();
      process.exit(0);
    } catch (error) {
      console.error('Test failed:', error);
      await disconnectRedis();
      process.exit(1);
    }
  });
  
  client.on('error', async (error) => {
    console.error('Test failed:', error);
    await disconnectRedis();
    process.exit(1);
  });
}

