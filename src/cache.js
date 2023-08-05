import { createClient } from 'redis';
import { env } from 'src/env';
import { readFileSync } from 'fs';

let auth = {};
if (env.nodeEnv === 'prod') {
    auth = {
        key: readFileSync(env.redis.privateKeyPath),
        cert: readFileSync(env.redis.certPath),
        ca: [readFileSync(env.redis.caPath)],
    };
}

const handleReconnection = (retries, error) => {
    if (error.code === 'ECONNREFUSED') {
        const delay = 2 ** (retries + 10);
        console.log(`Failed to connect Redis. Is it running? Retrying in ${delay} ms`);
        return delay;
    }
    return Math.min(retries * 50, 500);
};

const handleErrors = (err) => {
    if (err.code !== 'ECONNREFUSED') {
        console.log('Redis Client Error', err);
    }
};

export const cacheClient = createClient({
    username: env.redis.username,
    password: env.redis.password,
    socket: {
        host: env.redis.host,
        port: env.redis.port,
        tls: env.nodeEnv === 'prod',
        reconnectStrategy: handleReconnection,
        ...auth,
    },
});

export const connectCache = async () => {
    cacheClient.on('error', handleErrors);
    await cacheClient.connect().catch(handleErrors);
};
