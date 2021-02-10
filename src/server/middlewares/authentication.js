const _ = require('lodash');
const { SERVICE } = require('../../config');
const { SERVICES_TYPE } = require('../../config/constants');
const crypto = require('../../common/crypto');
const { UnauthenticatedError } = require('../../common/errors');

module.exports = () => async (ctx, next) => {
    const { authentication, user } = ctx.request.headers;

    if (SERVICE.TYPE === SERVICES_TYPE.INTERNAL && _.isNil(authentication)) {
        throw new UnauthenticatedError();
    }

    if (SERVICE.TYPE === SERVICES_TYPE.INTERNAL) {
        const authenticationPayload = await crypto.verifyJwtToken(authentication);
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
