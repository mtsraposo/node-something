class ProducerMock {
    async connect() {
        return Promise.resolve('connected');
    }

    async send({ _topic, _messages }) {
        return Promise.resolve('sent');
    }
}

export default ProducerMock;
