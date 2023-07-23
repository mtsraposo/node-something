import { serializePrivateKey } from '../utils.js';

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