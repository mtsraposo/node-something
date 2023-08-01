import BinanceRequest from '#root/src/models/requests/BinanceRequest.js';
import { BINANCE_SPOT_API_URL, HTTP_PATHS_TO_METHODS } from './constants.js';
import axios from 'axios';
import { env } from '#root/src/env.js';

class BinanceSpotApi {
    constructor({ url = BINANCE_SPOT_API_URL, httpClient = axios, auth = env.binance.auth.hmac }) {
        this.url = url;
        this.httpClient = httpClient;
        this.auth = auth;
    }

    request(httpVerb, path, payload, signed) {
        const { id, errors, isValid, params } = this.prepareData(httpVerb, path, payload, signed);

        if (!isValid) {
            return Promise.resolve({
                code: -1100,
                msg: `Invalid request: ${JSON.stringify(errors)}`,
            });
        }

        return this.httpClient({
            method: httpVerb,
            baseURL: this.url,
            url: path,
            params,
            headers: {
                'X-MBX-APIKEY': this.auth.apiKey,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            transformResponse: [
                function (data) {
                    const response = JSON.parse(data);
                    return { ...response, requestId: id };
                },
            ],
        });
    }

    prepareData(httpVerb, path, payload, signed) {
        const method = HTTP_PATHS_TO_METHODS.get(`${httpVerb}.${path}`);
        return new BinanceRequest(method, payload, {
            ...this.auth,
            signed,
        });
    }
}

export default BinanceSpotApi;
