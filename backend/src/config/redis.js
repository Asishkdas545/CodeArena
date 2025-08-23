const redis = require("redis");
require("dotenv").config();

const redisClient = redis.createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-15121.c322.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 15121
    }
});

module.exports = redisClient;