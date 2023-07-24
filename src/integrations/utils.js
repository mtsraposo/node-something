import crypto from 'node:crypto';
import fs from 'node:fs';

export const serializePrivateKey = (privateKeyPath) => {
    if (!fs.existsSync(privateKeyPath)) {
        throw new Error(`Private key path does not exist: ${privateKeyPath}`);
    }
    return crypto.createPrivateKey({
        key: fs.readFileSync(privateKeyPath, 'ascii'),
    });
};