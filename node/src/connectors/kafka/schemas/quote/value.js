const quoteValueSchema = {
    type: 'record',
    name: 'value',
    namespace: 'quote',
    fields: [
        { name: 'time', type: { type: 'long', logicalType: 'timestamp-millis' } },
        {
            name: 'symbol',
            type: 'string',
        },
        { name: 'price', type: 'double' },
    ],
};

export default quoteValueSchema;
