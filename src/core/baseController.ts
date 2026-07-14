/* eslint-disable class-methods-use-this */
import koa from 'koa';
import _ from 'lodash';
import { Permission } from 'accesscontrol';
import validation from './validation';
import authorization from './authorization';
import { UnexpectedError } from '../common/errors';
import { AccessType } from './../types/accessType';
import {ControllerConfig, HttpMethod} from './../types/controller';
import { MultipartConfig } from './../types/multipartConfig';

class BaseController<serviceClass> {
    public name: string;
    public path: string;
    public service: serviceClass;
    public routes: { method: HttpMethod; path: string; handler: string , multipart?:MultipartConfig}[] | [];
    public multipart?: MultipartConfig ;

    constructor(config: ControllerConfig<serviceClass>) {
        const { name, path, service, routes, } = config;
        this.name = name;
        this.path = path;
        this.service = service;
        this.routes = routes || [];
        
    }

    private async filterBody(ctx: koa.Context): Promise<void> {
        // Filter response if possible
        const body = _.get(ctx.response, 'body');
        const permission:Permission = _.get(ctx._locals, 'permission');

        let path = 'body';
        const bodyDescriptor:Record<string, unknown> = _.get(ctx, 'response.body._i');
        if (bodyDescriptor) {
            path = `body.${bodyDescriptor.dataPath}`;
            _.unset(ctx, 'response.body._i');
        }

        if (body && permission) {
            if (
                permission.attributes.length > 0 &&
                !(
                    permission.attributes.length === 1 &&
                    permission.attributes[0] === '*'
                )
            ) {
                await authorization.filterByPermission(
                    permission,
                    ctx.response,
                    path,
                );
            }
        }
    }

    async beforeAction(ctx: koa.Context, next: koa.Next): Promise<void> {
        // Add resource name to local variables
        _.set(ctx, '_locals.resource', this.name);

        await next();
    }

    async afterAction(ctx: koa.Context, next: koa.Next): Promise<void> {
        await next();

        // Filter response body based on user permission (if possible)
        // await this.filterBody(ctx);
    }

    // Context Hooks ////
    async authorize(
        ctx: koa.Context,
        access: AccessType | AccessType[],
        predicate?: () => Promise<boolean>,
    ): Promise<void>{
        if (_.isNil(ctx)) {
            throw new UnexpectedError('Invalid context object passed');
        }

        const { user, resource } = ctx._locals;
        const permission = await authorization.authorize(
            user,
            resource,
            access,
            predicate,
        );
        // Store permission for "afterAction" to be used for filtering
        _.set(ctx, '_locals.permission', permission);
        await authorization.filterByPermission(permission, ctx.request, 'body');
    }

    async validate(
        schema: Record<string, unknown>,
        data: object,
        strict: boolean = true,
    ): Promise<void> {
        validation.validate(schema, data, strict);
    }
}

export default BaseController;
