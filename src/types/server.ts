import { Middleware } from "koa"
import { IMiddleware } from "koa-router"
export interface ServerOptions { 
    name?:string,
    port?:string,
    hooks?:hook[],
    middlewares?:(Middleware | IMiddleware)[],
    onStart?:(...args: any[]) => void,
    onEnd?:(...args: any[]) => void,
    onError?:(...args: any[]) => void,
}

export interface hook{
    type: string,
    hook: {
        name: string
        func:unknown
    },
}