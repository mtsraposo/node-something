import { v4 as uuidv4 } from 'uuid';
import { FIELD_ENUMS, REQUIRED_ATTRIBUTES, REQUIRED_ATTRIBUTES_BY_TYPE } from './constants.js';
import { buildSignaturePayload, generateSignature } from './auth.js';
import logger from '#root/src/logger.js';

class BinanceRequest {
    constructor(method, params, auth) {
        this.method = method;
        this.params = params;
        this.apiKey = auth?.apiKey;
        this.privateKey = auth?.privateKey;
        this.signed = auth?.signed;

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
        if (!this.signed) return;
        const authParams = {
            apiKey: this.apiKey,
            ...this.params,
        };
        authParams.signature = this.sign(authParams).toString('base64');
        this.params = authParams;
    }

    sign(payload) {
        const signaturePayload = buildSignaturePayload(payload);
        return generateSignature(signaturePayload, this.privateKey);
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
