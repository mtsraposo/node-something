class SchemaRegistryMock {
    async encode(_id, toEncode) {
        return Promise.resolve(toEncode);
    }

    async register({ _type, _schema }, { _subject }) {
        return Promise.resolve('registered');
    }
}

export default SchemaRegistryMock;
