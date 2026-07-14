import _ from 'lodash';
import pino, { Formatters, LoggerOptions } from 'pino';

const logLevels: string[] = [
    'trace',
    'debug',
    'info',
    'warn',
    'error',
    'fatal',
    'silent',
];

const formatters: Formatters = {
    bindings(bindings) {
        return { pid: bindings.pid };
    },
};

// pretty.pipe(process.stdout);
const logger = pino({
    level: (process.env.LOG_LEVEL as LoggerOptions['level']) || 'info',
    timestamp: true,
    formatters,
    prettyPrint: {
        levelFirst: false,
        translateTime: true, // TODO - Only in development
    },
});

export default logger;
