const RESOURCES = {
    URL: 'file'
};

const ROLES = {
    INTERNAL: 'internal',
    PUBLIC: 'public'
};

const aclRoles = {
    [ROLES.INTERNAL]: {
        [RESOURCES.URL]: {
            'create:any': ['*'], 'read:any': ['*'], 'update:any': ['*']
        },
    },
    [ROLES.PUBLIC]: {
        [RESOURCES.URL]: {
            'read:any': ['*']
        },
    }
};

module.exports = {
    aclResources: RESOURCES,
    aclRoles
};
