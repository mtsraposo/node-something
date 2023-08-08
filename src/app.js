import { config } from 'dotenv';
import repl from 'repl';

import { authenticate, db } from 'src/db';
import { connectStreams, connectWebSocket } from 'src/websocket';
import { cache, connect } from 'src/cache';
import { env } from 'src/env';

config({ path: './env.js' });

async function main({
    binanceEnv = env.binance.env,
    cacheInstance = cache,
    dbInstance = db,
    spotApiProps = {},
    streamProps = {},
    webSocketProps = {},
}) {
    await authenticate(dbInstance);
    await connect(cacheInstance);
    return {
        webSocket: await connectWebSocket({ binanceEnv, spotApiProps, webSocketProps }),
        streams: await connectStreams(streamProps),
    };
}

if (process.argv[1] === __dirname) {
    console.log('Starting server...');
    const { webSocket, streams } = main({}).catch(console.error);
    const replServer = repl.start({ prompt: '> ' });
    replServer.context.webSocket = webSocket;
    replServer.context.streams = streams;
}

export { main };
