const crypto = require('crypto');
const fs = require('fs');
const { Buffer } = require('buffer');
const qs = require('qs');

const serializePrivateKey = (privateKeyPath) => {
    if (!fs.existsSync(privateKeyPath)) {
        throw new Error(`Private key path does not exist: ${privateKeyPath}`);
    }
    return crypto.createPrivateKey({
        key: fs.readFileSync(privateKeyPath, 'ascii'),
    });
};

const serializePublicKey = (publicKeyPath) => {
    if (!fs.existsSync(publicKeyPath)) {
        throw new Error(`Public key path does not exist: ${publicKeyPath}`);
    }
    return crypto.createPublicKey({
        key: fs.readFileSync(publicKeyPath, 'ascii'),
    });
};

const buildSignaturePayload = (payload) => {
    const sortedPayload = sortPayload(payload);
    return signatureBuffer(sortedPayload);
};

const signatureBuffer = (sortedPayload) => {
    return Buffer.from(qs.stringify(sortedPayload), 'ascii');
};

const sortPayload = (payload) => {
    return Object.keys(payload)
        .sort()
        .reduce((acc, key) => {
            acc[key] = payload[key];
            return acc;
        }, {});
};

const signEd25519 = (signaturePayload, privateKey) => {
    return crypto.sign(null, signaturePayload, privateKey);
};

const checkEd25519 = (payload, publicKey, signature) => {
    return crypto.verify(null, payload, publicKey, signature);
};

const signHmac = (signaturePayload, secretKey) => {
    const secretKeyObject = crypto.createSecretKey(secretKey);
    return crypto.createHmac('sha256', secretKeyObject).update(signaturePayload).digest('hex');
};

module.exports = {
    serializePrivateKey,
    serializePublicKey,
    buildSignaturePayload,
    signatureBuffer,
    sortPayload,
    signEd25519,
    checkEd25519,
    signHmac,
};
