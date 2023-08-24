const { Kafka, Partitioners } = require('kafkajs');
const { env } = require('../../env');
const { registerSchemas } = require('./registry');

const kafka = new Kafka({
    brokers: [env.kafka.host],
    clientId: env.kafka.clientId,
});

const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });

async function connectProducer(producerInstance) {
    await producerInstance.connect();
}

const produceMessage = async ({
    key,
    producerInstance,
    registryInstance,
    schema,
    topic,
    value,
}) => {
    const { keySchemaId, valueSchemaId } = schema;
    const outgoingMessage = {
        key: await registryInstance.encode(keySchemaId, key),
        value: await registryInstance.encode(valueSchemaId, value),
    };

    await producerInstance.send({
        topic,
        messages: [outgoingMessage],
    });
};

module.exports = {
    connectProducer,
    kafka,
    produceMessage,
    producer,
    registerSchemas,
};
