import { buildSignaturePayload, checkSignature, generateSignature } from '../src/models/requests/auth.js';

const crypto = await import('node:crypto');
const { Buffer } = await import('node:buffer');
const qs = await import('qs');
const fs = await import('node:fs');

const params = {
    apiKey: process.env.BINANCE_API_KEY,
    symbol: 'BTCUSDT',
    side: 'SELL',
    type: 'LIMIT',
    timeInForce: 'GTC',
    quantity: '1.0000000',
    price: '0.20',
    timestamp: new Date().getTime(),
};

const buffer = buildSignaturePayload(params);
console.log(qs.stringify(buffer));

const privateKey = crypto.createPrivateKey({
    key: fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'ascii'),
});
const publicKey = crypto.createPublicKey({
    key: fs.readFileSync('test-pub-key.pem', 'ascii'),
});

console.log(privateKey.asymmetricKeyType);
console.log(privateKey.type);

const signature = generateSignature(buffer, privateKey);
console.log(signature.toString('base64'));

const verified = checkSignature(buffer, publicKey, signature);
console.log(verified);