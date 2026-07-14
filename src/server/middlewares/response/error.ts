/* eslint no-undef: 0 */
import koa from 'koa'
import { CustomError } from '../../../types/customError';
import { ErrorPayload } from '../../../types/jwt';

export default () => async (ctx:koa.Context, next:koa.Next):Promise<void> => {
    try {
        await next();
    } catch (err) {
        const error = err as CustomError ;
        const payload: ErrorPayload = {
            code: error.code || 0,
            name: error.name,
            message: error.message || 'Error',
        };

        ctx.status = error.status || 500;
        // ajv errors
        if (error.status && error.status === 400) {
            // Handle ajv errors
            if (Array.isArray(error.errors)) {
                payload.details = error.errors;
                payload.message = 'validation error(s)';
            }
        }

        if (Api.params!.inDevelopment) {
            payload.stack = JSON.stringify(error.stack);
            Api.log!.error(error.stack);
        }

        if (ctx._locals.logger.enabled) {
            Api.log!.error(error.message);
        }

        ctx.body = payload;
    }
};
