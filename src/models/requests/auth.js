import crypto from 'node:crypto';
import fs from 'node:fs';
import { Buffer } from 'node:buffer';
import qs from 'qs';


export const serializePrivateKey = (privateKeyPath) => {
    if (!fs.existsSync(privateKeyPath)) {
        throw new Error(`Private key path does not exist: ${privateKeyPath}`);
    }
    return crypto.createPrivateKey({
        key: fs.readFileSync(privateKeyPath, 'ascii'),
    });
};

export const serializePublicKey = (publicKeyPath) => {
    if (!fs.existsSync(publicKeyPath)) {
        throw new Error(`Public key path does not exist: ${publicKeyPath}`);
    }
    return crypto.createPublicKey({
        key: fs.readFileSync(publicKeyPath, 'ascii'),
    });
};

export const buildSignaturePayload = (payload) => {
    const sortedPayload = Object.keys(payload).sort().reduce((acc, key) => {
        acc[key] = payload[key];
        return acc;
    }, {});
    return Buffer.from(qs.stringify(sortedPayload), 'ascii');
};

export const generateSignature = (signaturePayload, privateKey) => {
    return crypto.sign(null, signaturePayload, privateKey);
};

export const checkSignature = (payload, publicKey, signature) => {
    return crypto.verify(null, payload, publicKey, signature);
};