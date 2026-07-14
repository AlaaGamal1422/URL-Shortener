import koaBody from 'koa-body';
import compress from 'koa-compress';
import cors from '@koa/cors';

// Routes
import routes from './routes';

// Request middlewares
import { logger } from './request';
import requestInterceptors from './request/interceptors';
// Response middlewares
import { error, notFound } from './response';
import responseInterceptors from './response/interceptors';

// import authentication from './authentication';

const middlewares = [
    error(),
    compress(),
    responseInterceptors(),
    logger({ enabled: true }),
    cors(),
    koaBody(),
    requestInterceptors(),
    // authentication(),
    routes(),
    notFound(),
];

export default middlewares;
