import { config } from 'dotenv';
import repl from 'repl';
import { authenticateDb } from 'src/db';
import { connectStreams, connectWebSocket } from 'src/websocket';
import redisClient from 'src/cache';
import * as path from 'path';

config({ path: path.join(__dirname, 'env.js') });

async function main() {
    await authenticateDb();
    await redisClient.connect();
    return {
        webSocket: await connectWebSocket(),
        streams: await connectStreams(),
    };
}

const { webSocket, streams } = main().catch(console.error);
const replServer = repl.start({ prompt: '> ' });
replServer.context.webSocket = webSocket;
replServer.context.streams = streams;
