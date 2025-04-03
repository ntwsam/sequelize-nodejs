const redis = require('redis')

require('dotenv').config()

const redisClient = new redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    database: 1
});

(async () => {
    try {
        redisClient.on('error', (err) => {
            console.log('Redis client error:', err);
            process.exit(1);
        });
        redisClient.connect()
        console.log("Connct to redis")
    } catch (err) {
        console.log('Error to connect Redis:', 'err')
        process.exit(1)
    }
})();

module.exports = redisClient