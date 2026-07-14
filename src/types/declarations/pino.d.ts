declare module 'pino' {
    interface Logger {
        info(...args: unknown[]): void;
        warn(...args: unknown[]): void;
        error(...args: unknown[]): void;
        debug(...args: unknown[]): void;
        fatal(...args: unknown[]): void;
    }

    interface Bindings {
        pid: number;
        hostname: string;
    }

    export interface Formatters {
        bindings?(bindings: Bindings): object;
    }

    export interface LoggerOptions {
        formatters?: Formatters;
        level?:
            | 'trace'
            | 'debug'
            | 'info'
            | 'warn'
            | 'error'
            | 'fatal'
            | 'silent';
        timestamp?: boolean;
        prettyPrint?: {
            levelFirst: boolean;
            translateTime: boolean; // TODO - Only in development
        };
        enabled?: boolean;
    }

    export default function pino(options?: LoggerOptions): Logger;
}
