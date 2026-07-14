import { FILE_TYPES_ENUM } from '../../config/constants';

const schemas = {
    idSchema: {
        type: 'object',
        properties: {
            id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
        },
        required: ['id'],
        additionalProperties: false,
    },
    fileSchema: {
        type: 'object',
        properties: {
            owner: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
            type: { type: 'string', enum: FILE_TYPES_ENUM },
            title: { type: 'string', maxLength: 256 },
            description: { type: 'string', maxLength: 512 },
            url: { type: 'string', maxLength: 512 },
            expireIn: { type: 'string', format: 'date-time' },
            archived: { type: 'boolean' },
        },
        required: ['owner', 'title', 'url'],
        additionalProperties: false,
    },
    createUrlSchema: {
        type: 'object',
        properties: {
            originalUrl: {
                type: 'string',
                format: 'uri',
            },
            expiresAt: {
                type: 'string',
                format: 'date',
            },
        },
        required: ['originalUrl'],
        additionalProperties: false,
    },
    updateUrlSchema: {
        type: 'object',
        properties: {
            originalUrl: {
                type: 'string',
                format: 'uri',
            },
            expiresAt: {
                type: 'string',
                format: 'date',
            },
        },
        anyOf: [
            {
                required: ['originalUrl'],
            },
            {
                required: ['expiresAt'],
            },
        ],
        additionalProperties: false,
    },
    getUrlSchema: {
        type: 'object',
        properties: {
            shortCode: {
                type: 'string',
            },
        },
        required: ['shortCode'],
        additionalProperties: false,
    },
} as const;

export default schemas;
