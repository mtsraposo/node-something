import { ClientClosedError, createClient } from 'redis';
import { readFileSync } from 'fs';
import { env } from '../env';
import { logger } from '../logger';

const handleReconnection = (retries, error) => {
    if (error.code === 'ECONNREFUSED') {
        const delay = 2 ** (retries + 10);
        logger.error(`Failed to connect Redis. Is it running? Retrying in ${delay} ms`);
        return delay;
    }
    return Math.min(retries * 50, 500);
};

const handleErrors = (err) => {
    if (err.code !== 'ECONNREFUSED') {
        logger.error('Redis Client Error', err);
    }
};

const init = (auth) => {
    return createClient({
        username: env.redis.username,
        password: env.redis.password,
        socket: {
            host: env.redis.socket.host,
            port: env.redis.socket.port,
            tls: env.nodeEnv === 'production',
            reconnectStrategy: handleReconnection,
            ...auth,
        },
    });
};

const connectCache = async (cache) => {
    cache.on('error', handleErrors);
    await cache.connect().catch(handleErrors);
};

const disconnect = async (cache) => {
    try {
        await cache.disconnect();
    } catch (error) {
        if (error instanceof ClientClosedError) return;
        logger.error(`Failed to disconnect redis: ${error}`);
        throw new Error(error);
    }
};

let auth = {};
if (env.nodeEnv === 'production') {
    auth = {
        key: readFileSync(env.redis.privateKeyPath),
        cert: readFileSync(env.redis.certPath),
        ca: [readFileSync(env.redis.caPath)],
    };
}
const cache = init(auth);

cache.on('error', (error) => {
    console.error(`Received Redis error from server: ${error}`);
});

export { cache, connectCache, disconnect, init };
