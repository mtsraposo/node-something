import { SchemaRegistry, SchemaType } from '@kafkajs/confluent-schema-registry';
import DateType from './logicalTypes/DateType';
import { env } from 'src/env';
import { logger } from 'src/logger';

const connectRegistry = (SchemaRegistryClass = SchemaRegistry) => {
    const options = {
        [SchemaType.AVRO]: {
            logicalTypes: {
                'timestamp-millis': DateType,
            },
        },
    };

    return new SchemaRegistryClass({ host: env.kafka.schemaRegistryUrl }, options);
};

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

export { registerSchemas, connectRegistry };
