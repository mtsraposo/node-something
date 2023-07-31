class Logger {
    debug(...message) {
        console.debug(`DEBUG: ${message.join(' ')}`);
    }

    info(...message) {
        console.info(`INFO: ${message.join(' ')}`);
    }

    warn(...message) {
        console.warn(`WARN: ${message.join(' ')}`);
    }

    error(...message) {
        console.error(`ERROR: ${message.join(' ')}`);
    }
}

const logger = new Logger();

export default logger;
