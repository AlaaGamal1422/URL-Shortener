import koa from 'koa';
import headerParser from './headerParser';
import queryParser from './queryParser';
import mongoSanitizer from './mongoSanitizer';

export default () =>
    async (ctx: koa.Context, next: koa.Next): Promise<void> => {
        headerParser(ctx);
        queryParser(ctx);
        mongoSanitizer(ctx);

        await next();
    };
