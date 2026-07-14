// import  _ from 'lodash';
import Router from 'koa-router';
import Multipart from './request/multipart';
import { ValidationError } from '../../common/errors';

// Controllers
import index from '../../controllers/index';
import urlShortener from '../../controllers/urlShortener';

import { RouterWithMethods } from './../../types/router';
import { HttpMethod } from './../../types/controller';

const controllers = [index, urlShortener];
type  ControllerInctance = InstanceType<(typeof controllers)[number]>

function getActionsFromController(controller:ControllerInctance): Record<string,(...args: unknown[]) => unknown> {
    const actions: Record<string,(...args: unknown[]) => unknown> = {};
    const { prototype } = controller.constructor || [];

    Object.getOwnPropertyNames(prototype).forEach((key) => {
        if (key === 'constructor') {
            return;
        }

        actions[key] = prototype[key] ;
    });

    return actions;
}

function buildControllerRouter(controller:ControllerInctance): [string , Router.IMiddleware] {
    const router = new Router() as RouterWithMethods;
    const ctrlPath = controller.path;
    const ctrlRoutes = controller.routes;
    const { beforeAction, afterAction } = controller.constructor.prototype;
    const actions = getActionsFromController(controller);
    ctrlRoutes.forEach((route) => {
        const { method, path, handler, multipart } = route;

        if (!router.methods.includes(method)) {
            throw new ValidationError(`Method ${method} is not supported`);
        }

        const routerArgs = [
            path,
            afterAction.bind(controller),
            beforeAction.bind(controller),
            actions[handler]!.bind(controller),
        ];

        // TODO - to be injected as dependency, and remove "Multipart" middleware from request
        if (multipart) {
            const multipartParser = Multipart.create(multipart);
            routerArgs.splice(routerArgs.length - 1, 0, multipartParser);
        }

        // Type assertion is used because koa-router expects a specific middleware order
        // that doesn't match this implementation.
        (
        router[method.toLowerCase() as Lowercase<HttpMethod>] as (
            ...args: any[]
        ) => Router
            )(...routerArgs);
    });

    return [ctrlPath, router.routes()];
}

export default ():Router.IMiddleware<any, {}> => {
    const routes:[string, Router.IMiddleware<any, {}>][] = [];
    const router = new Router();

    controllers.forEach((Controller) => {
        const ctrlInstance = new Controller();
        const ctrlRoute = buildControllerRouter(ctrlInstance);
        routes.push(ctrlRoute);
    });

    routes.forEach((route) => {
        router.use(...route);
    });
    router.allowedMethods();
    return router.routes();
};
