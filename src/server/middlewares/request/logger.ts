/* eslint no-undef: 0 */
import _ from 'lodash';
import koa from 'koa';
import chalk from 'chalk';
import { Formatters, LoggerOptions } from 'pino';
import utils from '../../../common/utils';

const codeToColor = (code: number) => {
    if (code >= 500) {
        return chalk.red(code);
    }
    if (code >= 400) {
        return chalk.yellow(code);
    }
    if (code >= 300) {
        return chalk.cyan(code);
    }
    if (code >= 200) {
        return chalk.green(code);
    }
    return code;
};

const config = {
    enabled: true,
    level: 'info',
};

/**
 * @param options - object
 * @example {
 *     enabled: boolean,    (default true)
 *     level: string        (Log level ['info', 'warning', 'error'], default 'info')
 * }
 * @returns {function(*): function(...[*]=)}
 */
export default (options: LoggerOptions) => {
    const opts = utils.merge(config, options);
    return async (ctx: koa.Context, next: koa.Next): Promise<void> => {
        _.set(ctx, '_locals.logger', opts);

        const start = Date.now();
        await next();
        const delta = Math.ceil(Date.now() - start);

        const isEnabled: boolean = _.get(ctx, '_locals.logger.enabled');
        if (isEnabled) {
            Api.log!.debug(
                `${ctx.method} ${ctx.originalUrl} (${delta} ms) ${codeToColor(ctx.status)}`,
            );
        }
    };
};
