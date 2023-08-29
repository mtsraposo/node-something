import { config } from 'dotenv';
import repl from 'repl';
import path from 'path';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';

import { authenticateDb, db } from 'src/db';
import { connectStreams, connectWebSocket } from 'src/websocket';
import { cache, connectCache } from 'src/cache';
import { env } from 'src/env';
import { registerSchemas, connectRegistry } from 'src/connectors/kafka/registry';
import { connectProducer, producer } from 'src/connectors/kafka';
import { quoteValueSchema, timeKeySchema } from 'src/connectors/kafka/schemas/quote';
import { logger } from 'src/logger';

async function main({
    binanceEnv = env.binance.env,
    cacheInstance = cache,
    dbInstance = db,
    producerInstance = producer,
    quoteReceivedTopic = env.kafka.quoteReceivedTopic,
    SchemaRegistryClass = SchemaRegistry,
    spotApiProps = {},
    streamProps = {},
    webSocketProps = {},
}) {
    config({ path: './env.js' });
    await authenticateDb(dbInstance);
    await connectCache(cacheInstance);
    const registryInstance = connectRegistry(SchemaRegistryClass);
    const [{ id: timeKeySchemaId }, { id: quoteValueSchemaId }] = await registerSchemas(
        registryInstance,
        [
            { ...timeKeySchema, subject: `${quoteReceivedTopic}-key` },
            { ...quoteValueSchema, subject: `${quoteReceivedTopic}-value` },
        ],
    );
    await connectProducer(producerInstance);
    return {
        webSocket: await connectWebSocket({ binanceEnv, spotApiProps, webSocketProps }),
        streams: await connectStreams(streamProps, {
            producerInstance,
            quoteReceivedTopic,
            registryInstance,
            schemas: { timeKeySchemaId, quoteValueSchemaId },
        }),
    };
}

if (path.dirname(process.argv[1]) === __dirname) {
    logger.info('Starting server...');
    const { webSocket, streams } = main({}).catch(console.error);
    const replServer = repl.start({ prompt: '> ' });
    replServer.context.webSocket = webSocket;
    replServer.context.streams = streams;
}

export { main };
