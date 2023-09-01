import { Kafka, Partitioners } from 'kafkajs';
import { env } from 'src/env';
import { registerSchemas } from './registry';

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
    const { timeKeySchemaId, quoteValueSchemaId } = schema;
    const outgoingMessage = {
        key: await registryInstance.encode(timeKeySchemaId, key),
        value: await registryInstance.encode(quoteValueSchemaId, value),
    };

    await producerInstance.send({
        topic,
        messages: [outgoingMessage],
    });
};

export { connectProducer, kafka, produceMessage, producer, registerSchemas };
