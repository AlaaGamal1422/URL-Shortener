/* eslint-disable class-methods-use-this */
import koa from 'koa';
import BaseController from '../core/baseController';
import schema from '../core/validation/schemas';
import UrlShortnerService from '../service/urlShortener';
import { ExpiredUrl, NotFoundError } from '../common/errors';

class UrlShortener extends BaseController<UrlShortnerService> {
    constructor() {
        super({
            name: 'url',
            path: '/',
            service: new UrlShortnerService(),
            routes: [
                { method: 'GET', path: ':shortCode', handler: 'redirctUrl' },
                { method: 'GET', path: 'api/urls/', handler: 'getAllUrls' },
                {
                    method: 'GET',
                    path: 'api/urls/:shortCode',
                    handler: 'getUrl',
                },
                { method: 'POST', path: 'api/urls/', handler: 'addUrl' },
                {
                    method: 'PATCH',
                    path: 'api/urls/:shortCode',
                    handler: 'updateUrl',
                },
                {
                    method: 'DELETE',
                    path: 'api/urls/:shortCode',
                    handler: 'deleteUrl',
                },
            ],
        });
    }

    async getAllUrls(ctx: koa.Context, next: koa.Next):Promise<void> {
        // setting the role
        this.service.checkAccessibility(ctx);
        // authorization
        await this.authorize(ctx, 'readAny', undefined);
        // get all url docs
        const docs = await this.service.getUrls(ctx);
        // response
        ctx.status = 201;
        ctx.body = {
            success: true,
            data: docs,
            page: ctx.query.page,
            limit: ctx.query.limit,
            total: ctx.total,
        };
        next();
    }

    async getUrl(ctx: koa.Context, next: koa.Next):Promise<void> {
        // setting the role
        this.service.checkAccessibility(ctx);
        // authorization
        await this.authorize(ctx, 'readAny', undefined);
        // validation
        const data = ctx.params;
        await this.validate(schema.getUrlSchema, data, true);
        // get a url doc
        const doc = await this.service.getUrl(ctx,new NotFoundError('Expired'));
        // response
        ctx.status = 200;
        ctx.body = {
            success: true,
            data: doc,
        };
        next();
    }

    async addUrl(ctx: koa.Context, next: koa.Next):Promise<void> {
        // setting the role
        this.service.checkAccessibility(ctx);
        // authorization
        await this.authorize(ctx, 'createAny', undefined);
        // get body data
        const data = ctx.request.body;
        await this.validate(schema.createUrlSchema, data, true);
        // create
        const doc = await this.service.createUrl(ctx);

        ctx.status = 201;
        ctx.body = {
            success: true,
            data: doc,
        };
        next();
    }

    async updateUrl(ctx: koa.Context, next: koa.Next):Promise<void> {
        // setting the role
        this.service.checkAccessibility(ctx);
        // authorization
        await this.authorize(ctx, 'updateAny', undefined);
        // validation
        const data = ctx.request.body;
        await this.validate(schema.updateUrlSchema, data, true);
        // update
        const doc = await this.service.update(ctx);
        ctx.status = 200;
        ctx.body = {
            success: true,
            data: doc,
        };
        next();
    }

    async deleteUrl(ctx: koa.Context, next: koa.Next):Promise<void> {
        // setting the role
        this.service.checkAccessibility(ctx);
        // authorization
        await this.authorize(ctx, 'deleteAny', undefined);
        await this.service.delete(ctx);
        ctx.status = 204;
        ctx.body = {
            success: true,
            data: 'No content',
        };
        next();
    }

    async redirctUrl(ctx: koa.Context):Promise<void> {
        const doc = await this.service.getUrl(ctx,new ExpiredUrl('Expired'));
        const { originalUrl } = doc;
        await this.service.increaseVists(ctx);
        ctx.redirect(originalUrl);
    }
}
export default UrlShortener;
