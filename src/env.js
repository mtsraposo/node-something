import { serializePrivateKey } from '#root/src/models/requests/auth.js';

let ed25519;

if (process.env.BINANCE_ENV === 'prod') {
    ed25519 = {
        apiKey: process.env.BINANCE_API_KEY_ED25519,
        privateKeyPath: process.env.BINANCE_PRIVATE_KEY_PATH_ED25519_TESTNET,
    };
} else {
    ed25519 = {
        apiKey: process.env.BINANCE_API_KEY_ED25519_TESTNET,
        privateKeyPath: process.env.BINANCE_PRIVATE_KEY_PATH_ED25519,
    };
}

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
                apiKey: process.env.BINANCE_API_KEY_HMAC,
                privateKey: process.env.BINANCE_SECRET_KEY_HMAC,
            },
        },
        env: process.env.BINANCE_ENV,
    },
    openSSLPath: process.env.OPENSSL_PATH,
};
