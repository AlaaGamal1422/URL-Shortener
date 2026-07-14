const RESOURCES = {
    URL: 'file',
    urlShortener: 'url',
} as const;

const ROLES = {
    INTERNAL: 'internal',
    PUBLIC: 'public',
} as const;

const aclRoles = {
    [ROLES.INTERNAL]: {
        [RESOURCES.URL]: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
        },
        [RESOURCES.urlShortener]: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
    },
    [ROLES.PUBLIC]: {
        [RESOURCES.URL]: {
            'read:any': ['*'],
        },
        [RESOURCES.urlShortener]: {
            'read:any': ['*'],
        },
    },
} as const;

export { RESOURCES as aclResources, aclRoles };
