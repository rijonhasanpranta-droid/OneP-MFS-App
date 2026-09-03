// ===================== OneP MFS - Rate Limiter Middleware =====================
// প্রতি মিনিটে সর্বোচ্চ 5টি Request

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// Rate limiter middleware
const rateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:' // Redis key prefix
  }),
  windowMs: 1 * 60 * 1000, // 1 মিনিট
  max: 5, // সর্বোচ্চ 5 requests
  message: 'এই সময়ে বেশি Request করেছেন - কিছুক্ষণ পর চেষ্টা করুন',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { rateLimiter };
