import { serializePrivateKey } from '#root/src/models/requests/auth.js';
import BinanceRequest from '#root/src/models/requests/BinanceRequest.js';
import { HTTP_PATHS_TO_METHODS } from './constants.js';

class BinanceSpotApi {
    constructor(url, httpClient, apiKey, privateKeyPath) {
        this.url = url;
        this.httpClient = httpClient;
        this.apiKey = apiKey;
        this.privateKeyPath = privateKeyPath;

        this.privateKey = serializePrivateKey(this.privateKeyPath);
    }

    request(httpVerb, path, payload, signed) {
        const { errors, isValid, params: data } = this.prepareData(httpVerb, path, payload, signed);

        if (!isValid) {
            return Promise.resolve({
                code: -1100,
                msg: `Invalid request: ${JSON.stringify(errors)}`,
            });
        }

        return this.httpClient({
            method: httpVerb,
            baseURL: this.url,
            url: `/${path}`,
            data: data,
            timeout: 500,
            headers: { 'X-MBX-APIKEY': this.apiKey },
        });
    }

    prepareData(httpVerb, path, payload, signed) {
        const method = HTTP_PATHS_TO_METHODS.get(`${httpVerb}.${path}`);
        return new BinanceRequest(method, payload, {
            apiKey: this.apiKey,
            privateKey: this.privateKey,
            signed,
        });
    }
}

export default BinanceSpotApi;
