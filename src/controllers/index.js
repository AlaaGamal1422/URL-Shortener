/* eslint class-methods-use-this: off */
const BaseController = require('../core/baseController');

class Index extends BaseController {
    constructor() {
        super({
            name: 'root',
            path: '/',
            routes: [
                { method: 'GET', path: '/', handler: 'main' },
                { method: 'GET', path: 'live', handler: 'live' },
                { method: 'GET', path: 'ready', handler: 'ready' },
            ]
        });
    }

    async main(ctx) {
        ctx.body = {};
    }

    async live(ctx) {
        ctx.status = 200;
    }

    async ready(ctx) {
        ctx.status = 200;
    }
}

module.exports = Index;
