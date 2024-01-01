const RedisMock = require('ioredis-mock');
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");

const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;
chai.use(chaiAsPromised);
const { IORedis } = require('./redis.js');

describe('Redis Mock Tests', () => {

    describe('createRedisClusterClient', () => {
        it('should create a Redis Cluster client', () => {
            const clusterInstance = new RedisMock.Cluster(['redis://localhost:7001']);
            const createRedisClusterClientStub = sinon.stub(IORedis.prototype, 'createRedisClusterClient').returns(clusterInstance);

            const result = IORedis.prototype.createRedisClusterClient.call({ createRedisClusterClient: createRedisClusterClientStub });

            expect(result).to.equal(clusterInstance);
            expect(result.nodes().length).to.be.equal(1);

            createRedisClusterClientStub.restore();
        });
    });

    describe('createRedisClient', () => {
        it('should create a Redis client with specified host and port', () => {
            const host = 'localhost';
            const port = 6379;
            const redisInstance = new RedisMock({host,port});

            const createRedisClientStub = sinon.stub(IORedis.prototype, 'createRedisClient').returns(redisInstance);

            const result = IORedis.prototype.createRedisClient.call(
                { createRedisClient: createRedisClientStub },
                { host, port }
            );

            expect(result).to.equal(redisInstance);
            expect(result.options.host).to.equal(host);
            expect(result.options.port).to.equal(port);

            createRedisClientStub.restore();
        });
    });

    describe('getClient', () => {
        it('should create a Redis client when not in cluster mode', () => {
            const host = 'localhost';
            const port = 6379;

            const redisClient = new RedisMock({ host, port });

            const redisInstance = { createRedisClient: () => redisClient };
            const result = IORedis.prototype.getClient.call(redisInstance);
            expect(result).to.be.an.instanceOf(RedisMock);
        });

        it('should create a Redis Cluster client when in cluster mode', () => {
            process.env.REDIS_DRIVER = 'cluster';
        
            const clusterClient = new RedisMock.Cluster([{ host: 'localhost', port: 7001 }]);
            const redisInstance = { createRedisClusterClient: () => clusterClient };
        
            const result = IORedis.prototype.getClient.call(redisInstance);
        
            expect(result).to.be.an.instanceOf(RedisMock.Cluster);
        
            process.env.REDIS_DRIVER = undefined;
        });
    });

    describe('disconnect', () => {
        it('should disconnect the Redis client', async () => {
            const redisInstance = new RedisMock();
            redisInstance.client.disconnect = async () => {};

            const disconnectStub = sinon.stub(redisInstance.client, 'disconnect').resolves();

            await IORedis.prototype.disconnect.call(redisInstance);

            expect(disconnectStub.calledOnce).to.be.true;
        });
    });
});
