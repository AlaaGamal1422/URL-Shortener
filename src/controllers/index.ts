/* eslint class-methods-use-this: off */
import koa from 'koa';
import BaseController from '../core/baseController';
class Index extends BaseController<""> {
    constructor() {
        super({
            name: 'root',
            path: '/',
            service:"",
            routes: [
                { method: 'GET', path: '/', handler: 'main' },
                { method: 'GET', path: 'live', handler: 'live' },
                { method: 'GET', path: 'ready', handler: 'ready' },
            ],
        });
    }

    async main(ctx: koa.Context):Promise<void> {
        ctx.body = {};
    }

    async live(ctx: koa.Context):Promise<void> {
        ctx.status = 200;
    }

    async ready(ctx: koa.Context):Promise<void> {
        ctx.status = 200;
    }
}

export default Index;
