import {
    buildSignaturePayload,
    checkSignature,
    generateSignature,
    serializePrivateKey,
    serializePublicKey,
} from '../auth.js';

describe('serializePrivateKey', () => {
    it('returns a private key object', () => {
        const key = serializePrivateKey('unit-test-prv-key.pem');
        expect(key.asymmetricKeyType).toEqual('ed25519');
        expect(key.type).toEqual('private');
    });

    it('throws an error when the file path does not exist', () => {
        expect(() => serializePrivateKey('')).toThrow(Error);
    });
});

describe('serializePublicKey', () => {
    it('returns a public key object', () => {
        const key = serializePublicKey('unit-test-pub-key.pem');
        expect(key.asymmetricKeyType).toEqual('ed25519');
        expect(key.type).toEqual('public');
    });

    it('throws an error when the file path does not exist', () => {
        expect(() => serializePublicKey('')).toThrow(Error);
    });
});

describe('checkSignature', () => {
    it('checks whether a signature is valid', () => {
        const privateKey = serializePrivateKey('unit-test-prv-key.pem');
        const publicKey = serializePublicKey('unit-test-pub-key.pem');

        const params = {
            apiKey: 'test-api-key',
            symbol: 'BTCUSDT',
            side: 'SELL',
            type: 'LIMIT',
            timeInForce: 'GTC',
            quantity: '1.0000000',
            price: '0.20',
            timestamp: new Date().getTime(),
        };
        const signaturePayload = buildSignaturePayload(params);
        const signature = generateSignature(signaturePayload, privateKey);
        expect(checkSignature(signaturePayload, publicKey, signature)).toBe(true);
    });
});