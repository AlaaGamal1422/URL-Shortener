import Router from 'koa-router';

export type RouterWithMethods = Router & {
    methods: string[];
};
