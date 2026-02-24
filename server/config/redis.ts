import { Redis } from 'ioredis'
require('dotenv').config()

const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log("Redis Connecting...")
        return process.env.REDIS_URL
    }
    throw new Error('Redis connection failed!')
}

export const redis = new Redis(redisClient(), {
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    // Upstash specific settings
    maxRetriesPerRequest: null,
});

// Error Handling for Redis
redis.on('error', (err) => {
    console.log('Redis Error:', err.message)
})

redis.on('connect', () => {
    console.log('Redis Connected Successfully!')
})