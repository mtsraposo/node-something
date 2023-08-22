const { Kafka, Partitioners } = require('kafkajs');
const { SchemaRegistry, SchemaType } = require('@kafkajs/confluent-schema-registry');
const avro = require('avsc');

class DateType extends avro.types.LogicalType {
    _fromValue(val) {
        return new Date(val);
    }

    _toValue(date) {
        return +date;
    }

    _resolve(type) {
        if (avro.Type.isType(type, 'long', 'string', 'logical:timestamp-millis')) {
            return this._fromValue;
        }
    }
}

const options = {
    [SchemaType.AVRO]: {
        logicalTypes: {
            'timestamp-millis': DateType,
        },
    },
};
const registry = new SchemaRegistry({ host: 'http://localhost:8081' }, options);
const timescaleDbSinkTopic = 'dev.binance.quote.received.v1.avro';

const kafka = new Kafka({
    brokers: ['localhost:9092'],
    clientId: 'quote-producer',
});

const timeField = { name: 'time', type: { type: 'long', logicalType: 'timestamp-millis' } };
const keySchema = {
    type: 'record',
    name: 'key',
    namespace: 'quote',
    fields: [timeField],
};
const valueSchema = {
    type: 'record',
    name: 'value',
    namespace: 'quote',
    fields: [timeField, { name: 'symbol', type: 'string' }, { name: 'price', type: 'double' }],
};

const registerSchemas = () => {
    return Promise.all([
        registry.register(
            {
                type: SchemaType.AVRO,
                schema: JSON.stringify(keySchema),
            },
            { subject: `${timescaleDbSinkTopic}-key` },
        ),
        registry.register(
            {
                type: SchemaType.AVRO,
                schema: JSON.stringify(valueSchema),
            },
            { subject: `${timescaleDbSinkTopic}-value` },
        ),
    ]);
};

const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
const produceMessage = async ({ schema: { keySchemaId, valueSchemaId }, key, value }) => {
    await producer.connect();
    const outgoingMessage = {
        key: await registry.encode(keySchemaId, key),
        value: await registry.encode(valueSchemaId, value),
    };

    await producer.send({
        topic: timescaleDbSinkTopic,
        messages: [outgoingMessage],
    });
};

registerSchemas().then(async ([{ id: keySchemaId }, { id: valueSchemaId }]) => {
    try {
        const time = +new Date();
        await produceMessage({
            schema: { keySchemaId, valueSchemaId },
            key: { time: time },
            value: {
                time: time,
                symbol: 'BTCUSDT',
                price: 100.0,
            },
        });
        process.exit(0);
    } catch (e) {
        console.error('Error producing message', e);
        producer && (await producer.disconnect());
        process.exit(1);
    }
});
