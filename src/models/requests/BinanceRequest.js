import { v4 as uuidv4 } from 'uuid';
import { FIELD_ENUMS, REQUIRED_ATTRIBUTES, REQUIRED_ATTRIBUTES_BY_TYPE } from './constants.js';
import { buildSignaturePayload, signEd25519, signHmac } from './auth.js';
import logger from '#root/src/logger.js';

class BinanceRequest {
    constructor(method, params, auth) {
        this.method = method;
        this.params = params;
        this.auth = auth;

        this.id = null;
        this.body = {};
        this.isValid = true;
        this.errors = [];

        this.build();
    }

    build() {
        this.validate();

        if (this.isValid) {
            this.authenticate();
            this.id = uuidv4();
            this.buildBody();
        } else {
            logger.error(`Invalid params received: ${this.params}`);
        }
    }

    authenticate() {
        if (!this.auth.signed) return;
        switch (this.auth.type) {
            case 'ed25519':
                this.signEd25519();
                break;
            case 'hmac':
                this.signHmac();
                break;
            default:
                break;
        }
    }

    signEd25519() {
        const authParams = {
            apiKey: this.auth.apiKey,
            ...this.params,
        };
        const signaturePayload = buildSignaturePayload(authParams);
        authParams.signature = signEd25519(signaturePayload, this.auth.privateKey).toString(
            'base64',
        );
        this.params = authParams;
    }

    signHmac() {
        const signaturePayload = buildSignaturePayload(this.params);
        this.params.signature = signHmac(signaturePayload, this.auth.privateKey);
    }

    buildBody() {
        this.body = {
            id: this.id,
            method: this.method,
        };
        if (Object.keys(this.params).length !== 0) {
            this.body = { ...this.body, params: this.params };
        }
    }

    validate() {
        const requiredAttributes = REQUIRED_ATTRIBUTES.get(this.method) || [];
        const requiredAttributesByType = REQUIRED_ATTRIBUTES_BY_TYPE.get(this.method);
        const fieldEnums = FIELD_ENUMS.get(this.method);

        const required = [
            ...requiredAttributes,
            ...(requiredAttributesByType?.get(this.params?.type) || []),
        ];
        required.forEach((param) => {
            if (!Object.keys(this.params).includes(param)) {
                this.errors.push([param, 'required', undefined]);
                this.isValid = false;
            }
        });

        Object.entries(this.params).forEach(([param, value]) => {
            if (fieldEnums?.get(param) && !fieldEnums?.get(param)?.has(value)) {
                this.errors.push([param, 'enum', value]);
                this.isValid = false;
            }
        });
    }
}

export default BinanceRequest;
