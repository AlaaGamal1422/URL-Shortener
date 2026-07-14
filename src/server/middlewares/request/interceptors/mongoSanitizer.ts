import _ from 'lodash';
import koa from 'koa';

function sanitizeMongoData(body: any): void {
    if (body instanceof Object) {
        Object.keys(body).forEach((key) => {
            if (/^\$/.test(key)) {
                _.unset(body, key);
            } else {
                sanitizeMongoData(body[key]);
            }
        });
    }
}

export default (ctx: koa.Context): void => {
    const body: Record<string, unknown> = _.get(ctx, 'request.body');
    sanitizeMongoData(body);
};
