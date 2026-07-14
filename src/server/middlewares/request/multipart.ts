import _ from 'lodash';
import multer from '@koa/multer';
import koa from 'koa';
import utils from '../../../common/utils';
import { ValidationError } from '../../../common/errors';
import { MultipartConfig, MultipartField, MultrError } from '../../../types/multipartConfig';
import { CustomError } from '../../../types/customError';

const NAME = 'Multipart';
const DEFAULT_FILE_SIZE = 1 * 1024 * 1024;

// TODO - support individual file size

class Multipart {
    /**
     *
     * @param config
     * {
     *     parseBody: {type: 'boolean', default: true},
     *     fileSize: {type: 'number', description: 'Max file size'},
     *     fields: {
     *         maxCount: {type: 'number'},
     *         size: {type: 'number'},
     *         ext: {type: 'array'}
     *     }
     * }
     * @returns {function(...[*]=)}
     */
    private _options : MultipartConfig;
    constructor(config:MultipartConfig = {}) {
        this._options = {}
    }

    static create(config:MultipartConfig = {}){
         const instance = new Multipart(config);
          return async (ctx: koa.Context, next: koa.Next):Promise<void> => {
            try {
                instance._options = utils.merge(
                    {
                        parseBody: true,
                        fileSize: DEFAULT_FILE_SIZE,
                        fields: {},
                    },
                    config,
                );

                const { parseBody, fileSize } = instance._options;
                const fields = instance.buildFields(instance._options.fields ?? {});
                const multerConfig = {
                    storage: multer.memoryStorage(),
                    fileFilter: instance.filter.bind(instance ),
                    limits: {
                        fileSize,
                    },
                };

                const multipartParser = multer(multerConfig).fields(fields);
                await multipartParser(ctx, async () => {
                    if (parseBody) {
                        instance.parseBody(ctx);
                    }

                    await next();
                });
            } catch (err: any) {
                instance.errorHandler(err);
            }
        };
    }
    
    private buildFields(fields:Record<string, MultipartField>):MultipartField[]{
        return Object.entries(fields).map(([key, value]) => {
            const lowerCaseExt =
                value && value.ext? value.ext.map((e) => e.toLowerCase()) : [];
            _.set(fields, `${key}.ext`, lowerCaseExt);

            return {
                name: key,
                maxCount: value.maxCount,
                size: value.size,
                ext: lowerCaseExt,
            };
        });
    }

    private parseBody(ctx: koa.Context):void {
        if (ctx.request.method === 'POST' || ctx.request.method === 'PUT') {
            const contentType = _.get(ctx.request.headers, 'content-type');
            const contentTypeParts = contentType ? contentType.split(';') : [];
            if (
                contentType &&
                contentTypeParts.indexOf('multipart/form-data') >= 0 &&
                ctx.request.body &&
                ctx.request.body.data
            ) {
                ctx.request.body = JSON.parse(ctx.request.body.data);
            }
        }
    }

    _getFileExtension(name:string): string{
        const ext = '';
        if (name && name.length > 1) {
            const idx:number = name.lastIndexOf('.');
            if (idx >= 0) {
                return name.slice(idx + 1, name.length - idx);
            }
        }

        return ext;
    }

    filter(req:multer.MulterIncomingMessage, file: multer.File, filterNext:(error: Error | null, acceptFile: boolean) => void): void {
        const fileExt = this._getFileExtension(file.originalname);
        const allowedExt = _.get(this._options.fields, `${file.fieldname}.ext`) as string[] | undefined;

        if (allowedExt && !allowedExt.includes(fileExt)) {
            return filterNext(
                new ValidationError(
                    `${NAME}: Invalid file type, only [${allowedExt.toString()}] supported.`,
                ),
                false
            );
        }

        return filterNext(null, true);
    }

    private errorHandler(err:MultrError = {}): void {
        let error:MultrError|CustomError = err;
        let fieldCount :number | undefined = 0;

        switch (err.code) {
            case 'LIMIT_UNEXPECTED_FILE':
                fieldCount = _.get(
                    this._options.fields,
                    `${err.field}.maxCount`,
                )as number | undefined ;
                error = new ValidationError(
                    `${NAME}: Invalid field name or count must be less than or equal ${fieldCount} file(s)`,
                );
                break;
            case 'LIMIT_FILE_SIZE':
                error = new ValidationError(
                    `${NAME}: Files size must be equal to or less than ${this._options.fileSize} bytes`,
                );
                break;
            default:
        }

        throw error;
    }
}

export default Multipart;
