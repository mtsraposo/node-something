import { SchemaRegistry, SchemaType } from '@kafkajs/confluent-schema-registry';
import DateType from './logicalTypes/DateType';
import { env } from 'src/env';
import { logger } from 'src/logger';

const options = {
    [SchemaType.AVRO]: {
        logicalTypes: {
            'timestamp-millis': DateType,
        },
    },
};
const registry = new SchemaRegistry({ host: env.kafka.schemaRegistryUrl }, options);

const registerSchemas = async (registryInstance, schemas) => {
    logger.info('Registering schemas');
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
