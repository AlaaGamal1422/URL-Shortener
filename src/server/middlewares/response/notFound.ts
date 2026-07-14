import koa from 'koa'
import { NotFoundError } from '../../../common/errors';

export default () => async (ctx:koa.Context, next:koa.Next):Promise<void> => {
    if (ctx.status === 404) {
        throw new NotFoundError();
    }

    next();
};
