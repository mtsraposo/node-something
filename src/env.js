import { serializePrivateKey } from '#root/src/models/requests/auth.js';

export const env = {
    binance: {
        auth: {
            ed25519: {
                type: 'ed25519',
                apiKey: process.env.BINANCE_API_KEY,
                privateKey: serializePrivateKey(process.env.PRIVATE_KEY_PATH),
            },
            hmac: {
                type: 'hmac',
                apiKey: process.env.BINANCE_API_KEY_HMAC,
                privateKey: process.env.BINANCE_SECRET_KEY_HMAC,
            },
        },
        env: process.env.BINANCE_ENV,
    },
    openSSLPath: process.env.OPENSSL_PATH,
};
