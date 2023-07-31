import { serializePrivateKey } from '#root/src/models/requests/auth.js';

const suffix = process.env.BINANCE_ENV === 'prod' ? '' : '_TESTNET';
const ed25519 = {
    apiKey: process.env[`BINANCE_API_KEY_ED25519${suffix}`],
    privateKeyPath: process.env[`BINANCE_PRIVATE_KEY_PATH_ED25519${suffix}`],
};
const hmac = {
    apiKey: process.env[`BINANCE_API_KEY_HMAC${suffix}`],
    privateKey: process.env[`BINANCE_SECRET_KEY_HMAC${suffix}`],
};

export const env = {
    binance: {
        auth: {
            ed25519: {
                type: 'ed25519',
                apiKey: ed25519.apiKey,
                privateKey: serializePrivateKey(ed25519.privateKeyPath),
            },
            hmac: {
                type: 'hmac',
                apiKey: hmac.apiKey,
                privateKey: hmac.privateKey,
            },
        },
        env: process.env.BINANCE_ENV,
    },
    openSSLPath: process.env.OPENSSL_PATH,
};
