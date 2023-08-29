const timeKeySchema = {
    type: 'record',
    name: 'key',
    namespace: 'quote',
    fields: [{ name: 'time', type: { type: 'long', logicalType: 'timestamp-millis' } }],
};

export default timeKeySchema;
