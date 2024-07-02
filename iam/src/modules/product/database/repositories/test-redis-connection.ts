import * as dotenv from 'dotenv';
import Redis from 'ioredis';

// Load environment variables from .env file
dotenv.config();

console.log(process.env.REDIS_URL);
const redis = new Redis(process.env.REDIS_URL);

console.log(redis.get('philippiTelegramProducts'));

redis.set('test-key', 'test-value')
  .then(() => {
    return redis.get('test-key');
  })
  .then(value => {
    console.log('Redis test value:', value);
    redis.disconnect();
  })
  .catch(err => {
    console.error('Redis connection error:', err);
    redis.disconnect();
  });
