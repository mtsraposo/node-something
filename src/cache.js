import { createClient } from 'redis';
import { env } from './env';
import { readFileSync } from 'fs';

let auth = {};
if (env.nodeEnv === 'prod') {
    auth = {
        key: readFileSync(env.redis.privateKeyPath),
        cert: readFileSync(env.redis.certPath),
        ca: [readFileSync(env.redis.caPath)],
    };
}

const client = createClient({
    username: env.redis.username,
    password: env.redis.password,
    socket: {
        host: env.redis.host,
        port: env.redis.port,
        tls: env.nodeEnv === 'prod',
        ...auth,
    },
});

client.on('error', (err) => console.log('Redis Client Error', err));

export default client;
