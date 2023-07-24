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

const signaturePayload = Object.keys(params).sort().reduce((acc, key) => {
    acc[key] = params[key];
    return acc;
}, {});
const buffer = Buffer.from(qs.stringify(signaturePayload));
console.log(qs.stringify(signaturePayload));

const privateKey = crypto.createPrivateKey({
    key: fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'ascii'),
});
const publicKey = crypto.createPublicKey({
    key: fs.readFileSync('test-pub-key.pem', 'ascii'),
});

console.log(privateKey.asymmetricKeyType);
console.log(privateKey.type);

const signature = crypto.sign(null, buffer, privateKey);
console.log(signature.toString('base64'));

const verified = crypto.verify(null, buffer, publicKey, signature);
console.log(verified);