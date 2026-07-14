import koa from 'koa';

declare module 'koa' {
    interface Request {
        body: {
            data?: string,
            [key:string] : unknown;
        }
    }
}
