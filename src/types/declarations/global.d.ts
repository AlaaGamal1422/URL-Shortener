import type { Logger } from 'pino';

declare global{
    var Api: {
        log?:Logger,
        params?:Record<string,unknown>,
        [key:string]:unknown
    }
}
export {};