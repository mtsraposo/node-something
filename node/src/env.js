const { serializePrivateKey } = require('./clients/requests/auth');
const path = require('path');

const suffix = process.env.BINANCE_ENV === 'production' ? '' : '_TESTNET';
const ed25519 = {
    apiKey: process.env[`BINANCE_API_KEY_ED25519${suffix}`],
    privateKeyPath: process.env[`BINANCE_PRIVATE_KEY_PATH_ED25519${suffix}`],
};
const hmac = {
    apiKey: process.env[`BINANCE_API_KEY_HMAC${suffix}`],
    privateKey: process.env[`BINANCE_SECRET_KEY_HMAC${suffix}`],
};

const env = {
    binance: {
        auth: {
            ed25519: {
                type: 'ed25519',
                apiKey: ed25519.apiKey,
                privateKey: serializePrivateKey(
                    path.join(path.dirname(__dirname), ed25519.privateKeyPath),
                ),
            },
            hmac: {
                type: 'hmac',
                apiKey: hmac.apiKey,
                privateKey: hmac.privateKey,
            },
        },
        env: process.env.BINANCE_ENV || 'development',
    },
    nodeEnv: process.env.NODE_ENV || 'development',
    openSSLPath: process.env.OPENSSL_PATH,
    postgres: {
        name: process.env.POSTGRES_NAME || 'postgres',
        username: process.env.POSTGRES_USERNAME || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
    },
    redis: {
        username: process.env.REDIS_USERNAME || 'default',
        password: process.env.REDIS_PASSWORD || 'secret',
        socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            key: process.env.REDIS_PRIVATE_KEY_PATH,
            certPath: process.env.REDIS_CERT_PATH,
            caPath: process.env.REDIS_CA_PATH,
        },
    },
};

module.exports = { env };
