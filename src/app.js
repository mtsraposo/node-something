import { config } from 'dotenv';
import repl from 'node:repl';
import { authenticateDb } from '#root/models/index.js';
import { connectStreams, connectWebSocket } from '#root/src/websocket.js';

config();

await authenticateDb();
const webSocket = await connectWebSocket();
const streams = await connectStreams();

const replServer = repl.start({ prompt: '> ' });
replServer.context.webSocket = webSocket;
replServer.context.streams = streams;
