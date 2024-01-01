const Redis = require('ioredis');

module.exports.IORedis = class IORedis {
    constructor(properties = {}) {
        const defaultProperties = {
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: process.env.REDIS_PORT || 6379,
        };

        this.properties = Object.assign({}, defaultProperties, properties);

        if (process.env.REDIS_DRIVER === "cluster") {
            this.properties.host = process.env.ClusterAddress || defaultProperties.host;
        }
        this.client = this.getClient();
    }

    createRedisClusterClient() {
        const { host, port } = this.properties;

        const db = new Redis.Cluster(
            [{ host, port }],
            {
                dnsLookup: (address, callback) => callback(null, address),
                redisOptions: {
                    tls: true,
                },
            }
        );

        return db;
    }

    createRedisClient() {
        const { host, port } = this.properties;

        const db = new Redis({
            host: host,
            port: port, // Default Redis port
        });

        return db;
    }

    getClient() {
        if (process.env.REDIS_DRIVER === "cluster") {
            return this.createRedisClusterClient();
        } else {
            return this.createRedisClient();
        }
    }

    async disconnect() {
        await this.client.disconnect();
    }

}

