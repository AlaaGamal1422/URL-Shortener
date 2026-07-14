import _ from 'lodash';
import koa from 'koa';
import utils from '../../../../common/utils';
import {tragetedConfigurations} from '../../../../config';
import { ParsedQuery } from './../../../../types/parsedQuery';

const { pageSize, maxPageSize } = tragetedConfigurations.common;

export default (ctx: koa.Context): void => {
    let page: number;
    let limit: number;
    const { query } = ctx.request;
    const parsedQuery: ParsedQuery = {
        page: 1,
        limit: pageSize,
        projection: {},
        sort: {},
    };
    Object.entries(query).forEach(([key, value]): void => {
        switch (key) {
            case 'page':
                page = utils.parseInt(value);
                page = page >= 1 ? page : 1;
                parsedQuery.page = page;
                break;
            case 'limit':
                limit = utils.parseInt(value);
                limit = limit >= maxPageSize ? maxPageSize : limit;
                parsedQuery.limit = limit;
                break;
            case 'projection':
                (value as string).split(',').forEach((entry): void => {
                    const op = entry.startsWith('-') ? 0 : 1;
                    const field = op === 1 ? entry : entry.slice(1);
                    parsedQuery.projection[field] = op;
                });
                break;
            case 'sort':
                (value as string).split(',').forEach((entry): void => {
                    let field = entry.trim();
                    const op = field.startsWith('-') ? -1 : 1;

                    if (!field || field.length === 0) {
                        return;
                    }

                    if (op < 0) {
                        field = field.slice(1);
                    }

                    parsedQuery.sort[field] = op;
                });
                break;
            default:
                parsedQuery[key] = value;
        }
    });

    _.merge(ctx.request.query, parsedQuery);
};
