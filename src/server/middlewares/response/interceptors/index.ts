import koa from 'koa'
export default () => async (ctx:koa.Context, next:koa.Next):Promise<void> => {
    await next();
};
