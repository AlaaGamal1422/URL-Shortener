import _ from 'lodash';
import koa from 'koa';
import  {HydratedDocument }  from 'mongoose';

import UrlShortenerModel from '../models/urlShortner';
import { ValidationError, NotFoundError, ExpiredUrl, UnexpectedError, BaseError }  from '../common/errors';
import { ParsedQueryWithFilter }  from './../types/parsedQuery';
import { Url } from '../types/schemas/url';

class urlShortenerService {
    private model
    constructor() {
        this.model = UrlShortenerModel;
    }

    private prepareQuery(ctx:koa.Context, queryObj:Record<string,unknown>):ParsedQueryWithFilter {
        const notAllowedQuery:string[] = ['page', 'limit', 'sort', 'projection'];
        const parsedFilter :Record<string,unknown> = {
            $or: [{ expireAt: { $gt: new Date() } }, { expireAt: null }],
        };
        Object.keys(queryObj).forEach((key) => {
            if (notAllowedQuery.includes(key)) {
                return;
            }
            parsedFilter[key] = queryObj[key];
        });
        let { sort, projection, page, limit } = ctx.request.query;
        const skip = (Number(page) - 1) * Number(limit);
        const query = this.model
            .find(parsedFilter, projection)
            .skip(skip)
            .limit(Number(limit))
            .sort(sort as string);
        return {
            query,
            page,
            limit,
            parsedFilter,
        };
    }

    // eslint-disable-next-line class-methods-use-this
    private isFuturDate(date:Date):boolean {
        const checkedDate = new Date(date) > new Date();
        return checkedDate;
    }

    // eslint-disable-next-line class-methods-use-this
    checkAccessibility(ctx:koa.Context): void {
        const user = {
            roles: '',
        };
        if (ctx.header['x-internal']) {
            user.roles = 'internal';
        } else {
            user.roles = 'public';
        }
        _.set(ctx, '_locals.user', user);
    }

    async increaseVists(ctx:koa.Context):Promise<koa.Context> {
        const { shortCode } = ctx.params;
        const doc = await this.model.findOneAndUpdate(
            { shortCode },
            {
                $inc: {
                    visits: 1,
                },
            },
            { new: true },
        );
        if (!doc) throw new UnexpectedError('Failed to update Visits counts');
        ctx.body = {
            data: doc,
        };
        return ctx;
    }

    async getUrls(ctx:koa.Context): Promise<Url[]> {
        const query = this.prepareQuery(ctx, { ...ctx.request.query });
        const docs:Url[] = [];
        const urlDocs:Record<string,any>[] = await query.query as Record<string,any>[];
        if (!urlDocs) {
            throw new NotFoundError('Can not find these docs');
        }
        urlDocs.forEach((doc):void => {
            const newDoc:Url = { ...doc._doc };
            newDoc.shortUrl = doc.getShotUrl(ctx, doc);
            docs.push(newDoc);
        });
        const total = await this.model.countDocuments(query.parsedFilter);
        ctx.total = total;
        return docs;
    }

    async getUrl(ctx:koa.Context,errClass:Error): Promise<Url> {
        const { shortCode } = ctx.params;
        const urlDoc = await this.model.findOne({ shortCode });
        if (!urlDoc) {
            throw new NotFoundError('Can not find this doc');
        }
        if ( urlDoc.expiresAt && !this.isFuturDate(urlDoc.expiresAt) && urlDoc.expiresAt !== null) {
            throw errClass;
        }
        return urlDoc;
    }

    async createUrl(ctx:koa.Context): Promise<Url> {
        const data = ctx.request.body;
        if (data.expiresAt && !this.isFuturDate(data.expiresAt)) {
            // eslint-disable-next-line no-unused-expressions
            throw new ValidationError('Expire at should be a futur date');
        }
        const urlDoc = await this.model.create(data);
        if (!urlDoc) {
            throw new NotFoundError('Can not create a new shorten url');
        }
        return urlDoc;
    }

    async update(ctx:koa.Context): Promise<Url> {
        const { shortCode } = ctx.params;
        const data = ctx.request.body;
        if (data.expiresAt && !this.isFuturDate(data.expiresAt)) {
            // eslint-disable-next-line no-unused-expressions
            throw new ValidationError('Expire at should be a futur date');
        }
        const urlDoc = await this.model.findOneAndUpdate({ shortCode }, data, {
            new: true,
        });
        if (!urlDoc) throw new NotFoundError('Can not find this doc');
        return urlDoc;
    }

    async delete(ctx:koa.Context):Promise<void> {
        const { shortCode } = ctx.params;
        const urlDoc = await this.model.findOneAndDelete({ shortCode });
        if (!urlDoc) throw new NotFoundError('Can not find this doc');
    }
}

export default urlShortenerService;
