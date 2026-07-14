import { MultipartConfig } from './../types/multipartConfig';
export type HttpMethod =
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'PATCH'
    | 'DELETE'
    | 'HEAD'
    | 'OPTIONS';
export interface ControllerConfig<serviceClass> {
    name: string;
    path: string;
    service: serviceClass;
    routes: { method: HttpMethod; path: string; handler: string,  multipart?:MultipartConfig}[] | [];
    multipart?:MultipartConfig
}