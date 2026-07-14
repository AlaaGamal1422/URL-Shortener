/* eslint class-methods-use-this: 0 */
import _ from 'lodash';
import http from 'http';
import Koa from 'koa';
import {AddressInfo} from 'node:net';
// Localization
import locale from 'koa-locale';
import i18n from 'koa-i18n';

import {tragetedConfigurations} from '../config';
import utils from '../common/utils';
import DataBase from './dataBase/mongoDb';

import {ServerOptions} from './../types/server';


const { api, locales } =  tragetedConfigurations;
class Server {
    public options:ServerOptions
    private app : Koa;
    private server : http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> ;
    public mongoDb : DataBase;
    /**
     *
     * @param options
     * {
     *     name:
     *     port:
     *     hooks:
     *     middlewares:
     *     onStart:
     *     onEnd:
     *     onError:
     * }
     */
    constructor(options:ServerOptions = {}) {
        this.options = utils.merge(
            {
                port: process.env.PORT || api.port,
                hooks: {},
                middlewares: [],
            },
            options,
        );

        // Init global field
        global.Api = {};
        this.applyGlobals();

        // Init koa app
        this.app = this.createKoaInstance();
        this.server = http.createServer(this.app.callback());

        // Database inctence
        this.mongoDb = new DataBase();
        // this.mongoDb = new DataBase();
    }

    private createKoaInstance(): Koa<Koa.DefaultState, Koa.DefaultContext> {
        const app = new Koa();
        // General
        app.proxy = true;
        // Localization config
        locale(app);
        app.use(
            i18n(app, {
                locales: locales.supportedLocales,
                directory: locales.dataPath,
                extension: locales.dataExtension,
                register: global.Api.locales,
                updateFiles: false,
                modes: [
                    'query', //  optional detect querystring - `/?locale=en`
                    'header', //  optional detect header      - `Accept-Language: zh-CN,zh;q=0.5`
                ],
            }),
        );

        return app;
    }

    private applyGlobals() :void {
        const env = process.env.NODE_ENV || 'development';

        _.set(global, 'Api.locales', {});
        _.set(global, 'Api.params.inDevelopment', env === 'development');
    }

    private applyHooks() :void {
        const { hooks } = this.options;
        hooks!.forEach((item) => {
            if (item.type === 'context') {
                this.app.context[item.hook.name] = item.hook.func;
            } else if (item.type === 'global') {
                global.Api[item.hook.name] = item.hook.func;
            }
        });
    }

    private applyMiddlewares():void {
        const { middlewares } = this.options;
        middlewares!.forEach((item) => {
            this.app.use(item);
        });
    }

    async start():Promise<void> {
        const { name, port, onStart, onError } = this.options;

        if (onError) {
            this.app.on('error', onError);
        }

        if (onStart) {
            await onStart(this.app);
        }

        this.applyHooks();
        this.applyMiddlewares();
        // DataBase Connection
        await this.mongoDb.connectDb();
        await new Promise((resolve, reject) => {
            this.server.on('error', (err:NodeJS.ErrnoException) => {
                if (err.syscall !== 'listen') {
                    return reject(err);
                }

                switch (err.code) {
                    case 'EACCES':
                        console.error(
                            `port ${port} requires elevated privileges`,
                        );
                        process.exit(1);
                        break;
                    case 'EADDRINUSE':
                        console.error(`port ${port} is already in use`);
                        process.exit(1);
                        break;
                    default:
                        if (onError) {
                            onError(err);
                        }
                        reject(err);
                }
                return true;
            });

            this.server.on('listening', () => {
                resolve("");
            });

            this.server.listen(port);
        });

        // Type assertion is used to preserve the original runtime behavior.
        // If info is null, accessing its properties will still throw an error.
        const info = this.server.address() as AddressInfo;
        const env = process.env.NODE_ENV || 'development';
        const lHost:string = info.address === '::' ? 'localhost' : info.address;
        const lPort = info.port;

        console.log(`API [${name}] started at [${lHost}:${lPort}] on [${env}]`);
    }

    async stop():Promise<void> {
        const { onEnd } = this.options;
        if (onEnd) {
            await onEnd();
        }

        if (this.server && this.server.listening) {
            this.server.close();
        }
    }
}

export default Server;
