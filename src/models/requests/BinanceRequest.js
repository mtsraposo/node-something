import qs from 'qs';
import crypto from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'node:buffer';

const REQUIRED_ATTRIBUTES = new Set(['symbol', 'side', 'type']);
const REQUIRED_ATTRIBUTES_BY_TYPE = new Map(
    [
        ['LIMIT', new Set(['timeInForce', 'price', 'quantity'])],
        ['MARKET', new Set(['quantity'])],
    ],
);

const FIELD_ENUMS = new Map(
    [
        ['side', new Set(['BUY', 'SELL'])],
        ['type', new Set(['LIMIT', 'LIMIT_MAKER', 'MARKET', 'STOP_LOSS', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT', 'TAKE_PROFIT_LIMIT'])],
        ['newOrderRespType', new Set(['ACK', 'RESULT', 'FULL'])],
        ['timeInForce', new Set(['GTC', 'IOC', 'FOK'])],
    ],
);

class BinanceRequest {
    constructor(apiKey, privateKey, method, params) {
        this.apiKey = apiKey;
        this.privateKey = privateKey;
        this.method = method;
        this.params = params;

        this.id = null;
        this.body = {};
        this.isValid = true;
        this.errors = [];

        this.build();
    }

    build() {
        this.validate();

        if (this.isValid) {
            this.includeOptions();
            const signedParams = this.authenticate();
            this.id = uuidv4();
            this.body = {
                id: this.id,
                method: this.method,
                params: signedParams,
            };
        } else {
            console.error(`Invalid params received: ${this.params}`);
        }
    }

    includeOptions() {
        this.params = {
            recvWindow: 5000,
            timestamp: new Date().getTime(),
            ...this.params,
        };
    }

    authenticate() {
        let authParams = {
            apiKey: this.apiKey,
            ...this.params,
        };
        authParams['signature'] = this.signParams(authParams);
        return authParams;
    }

    signParams(authParams) {
        return crypto
            .sign(null, Buffer.from(qs.stringify(authParams)), this.privateKey)
            .toString('base64');
    }

    validate() {
        const required = [
            ...REQUIRED_ATTRIBUTES,
            ...(REQUIRED_ATTRIBUTES_BY_TYPE.get(this.params?.type) || []),
        ];
        required.forEach(param => {
            if (!Object.keys(this.params).includes(param)) {
                this.errors.push([param, 'required', undefined]);
                this.isValid = false;
            }
        });

        Object.entries(this.params).forEach(([param, value]) => {
            if (FIELD_ENUMS.get(param) && !FIELD_ENUMS.get(param)?.has(value)) {
                this.errors.push([param, 'enum', value]);
                this.isValid = false;
            }
        });
    }
}

export default BinanceRequest;