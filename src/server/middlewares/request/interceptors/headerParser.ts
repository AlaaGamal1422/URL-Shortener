import _ from 'lodash';
import koa from 'koa';
import utils from '../../../../common/utils';

export default (ctx: koa.Context): void => {
    const { headers } = ctx;
    // Set needed local variables

    // Timezone
    const timezone = utils.parseInt(headers.timezone as string) || 0;
    _.set(ctx, '_locals.timezone', timezone);
    // Locale
    _.set(ctx, '_locals.locale', ctx._i18n.getLocale());
};
