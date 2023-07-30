import { v4 as uuidv4 } from 'uuid';

class HttpClientMock {
    constructor() {
        this.request = this.request.bind(this);
        this.response = this.response.bind(this);
    }
    request({ url }) {
        const response = this.response(url);
        return Promise.resolve(response);
    }

    response(url) {
        switch (url) {
            case '/userDataStream':
                return { listenKey: uuidv4() };
            default:
                return {};
        }
    }
}

export default HttpClientMock;
