class Logger {
    debug(message) {
        console.debug(`DEBUG: ${message}`);
    }

    info(message) {
        console.info(`INFO: ${message}`);
    }

    warn(message) {
        console.warn(`WARN: ${message}`);
    }

    error(message) {
        console.error(`ERROR: ${message}`);
    }
}

const logger = new Logger();

export default logger;
