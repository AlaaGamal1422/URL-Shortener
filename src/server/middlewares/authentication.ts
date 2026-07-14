import  _ from 'lodash';
import koa from 'koa'
import  { SERVICE } from '../../config';
import  { SERVICES_TYPE } from '../../config/constants';
import  crypto from '../../common/crypto';
import  { UnauthenticatedError } from '../../common/errors';

export default () => async (ctx:koa.Context, next:koa.Next):Promise<void> => {
    const { authentication, user } = ctx.request.headers;

    if (SERVICE.TYPE === SERVICES_TYPE.INTERNAL && _.isNil(authentication)) {
        throw new UnauthenticatedError();
    }

    if (SERVICE.TYPE === SERVICES_TYPE.INTERNAL) {
        const authenticationPayload =
            await crypto.verifyJwtToken(authentication as string);
        const { name, cid } = authenticationPayload;

        _.set(ctx, '_locals.service', { name, cid });
        _.set(ctx, '_locals.user', user);
        return next();
    }

    if (SERVICE.TYPE === SERVICES_TYPE.EXTERNAL) {
        _.set(ctx, '_locals.service', { name: 'public' });
        _.set(ctx, '_locals.user', user);
        return next();
    }

    throw new UnauthenticatedError();
};
