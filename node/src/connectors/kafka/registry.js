const { SchemaRegistry, SchemaType } = require('@kafkajs/confluent-schema-registry');
const { DateType } = require('./logicalTypes/DateType');
const { env } = require('../../env');

const options = {
    [SchemaType.AVRO]: {
        logicalTypes: {
            'timestamp-millis': DateType,
        },
    },
};
const registry = new SchemaRegistry({ host: env.kafka.schemaRegistryUrl }, options);

const registerSchemas = async (registryInstance, schemas) => {
    return await Promise.all(
        schemas.map((schema) => {
            return registryInstance.register(
                {
                    type: SchemaType.AVRO,
                    schema: JSON.stringify(schema),
                },
                { subject: schema.subject },
            );
        }),
    );
};

module.exports = { registerSchemas, registry };
