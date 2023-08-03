import { config } from 'dotenv';
import repl from 'node:repl';
import { authenticateDb } from '#root/models/index.js';
import { connectStreams, connectWebSocket } from '#root/src/websocket.js';

config();

async function main() {
    await authenticateDb();
    return {
        webSocket: await connectWebSocket(),
        streams: await connectStreams(),
    };
}

const { webSocket, streams } = main().catch(console.error);
const replServer = repl.start({ prompt: '> ' });
replServer.context.webSocket = webSocket;
replServer.context.streams = streams;
