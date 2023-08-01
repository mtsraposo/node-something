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
    const sortedPayload = sortPayload(payload);
    return signatureBuffer(sortedPayload);
};

export const signatureBuffer = (sortedPayload) => {
    return Buffer.from(qs.stringify(sortedPayload), 'ascii');
};

export const sortPayload = (payload) => {
    return Object.keys(payload)
        .sort()
        .reduce((acc, key) => {
            acc[key] = payload[key];
            return acc;
        }, {});
};

export const signEd25519 = (signaturePayload, privateKey) => {
    return crypto.sign(null, signaturePayload, privateKey);
};

export const checkEd25519 = (payload, publicKey, signature) => {
    return crypto.verify(null, payload, publicKey, signature);
};

export const signHmac = (signaturePayload, secretKey) => {
    const secretKeyObject = crypto.createSecretKey(secretKey);
    return crypto.createHmac('sha256', secretKeyObject).update(signaturePayload).digest('hex');
};
