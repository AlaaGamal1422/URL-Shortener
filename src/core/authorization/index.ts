/* eslint-disable no-unused-vars */
import _ from 'lodash';
import { AccessControl, Permission } from 'accesscontrol';
import floppyFilter from 'floppy-filter';
import { AccessType } from './../../types/accessType';
import { User } from './../../types/jwt';
import { aclRoles, aclResources } from './accessList';
import { UnauthorizedError, ValidationError } from '../../common/errors';

const ACCESS_TYPES: string[] = [
    'createOwn',
    'createAny',
    'readOwn',
    'readAny',
    'updateOwn',
    'updateAny',
    'deleteOwn',
    'deleteAny',
];

class Authorization {
    accessType: string[];
    acl: AccessControl;
    constructor() {
        // this.roles = roles;
        // this.resources = resources;
        this.accessType = ACCESS_TYPES;
        this.acl = new AccessControl(aclRoles);
    }

    private async getAccess(
        roles: string,
        resource: string,
        access: AccessType | AccessType[],
        predicate?: () => Promise<boolean>,
    ): Promise<{
    permission: Permission | undefined;
    allowed: boolean;
    }> {
        let permission: Permission | undefined;
        let allowed: boolean = false;
        let userAccess: string;
        let nAccess: AccessType | AccessType[] = Array.isArray(access)
            ? access
            : [access];

        if (
            !nAccess ||
            _.intersection(nAccess, this.accessType).length !== nAccess.length
        ) {
            throw new ValidationError(
                'Missing or invalid authorization access type',
            );
        }

        for (let i = 0; i < nAccess.length; i += 1) {
            permission = this.acl.can(roles)[nAccess[i]!](resource);
            if (permission.granted) {
                userAccess = nAccess[i]!;
                if (!_.isNil(predicate)) {
                    if (userAccess.toLowerCase().endsWith('own')) {
                        // eslint-disable-next-line no-await-in-loop
                        const result = await predicate();

                        if (result) {
                            allowed = true;
                            break;
                        }

                        break;
                    }
                }

                allowed = true;
                break;
            }
        }
        return { permission, allowed };
    }

    async authorize(
        user: User,
        resource: string,
        access: AccessType | AccessType[],
        predicate?: () => Promise<boolean>,
    ): Promise<Permission> {
        if (_.isNil(user)) {
            throw new UnauthorizedError();
        }

        const { roles } = user;
        const { permission, allowed } = await this.getAccess(
            roles,
            resource,
            access,
            predicate,
        );

        if (permission?.granted === true && allowed === true) {
            return permission;
        }

        throw new UnauthorizedError();
    }

    // eslint-disable-next-line class-methods-use-this
    async filterByPermission(
        permission: Permission,
        data: object,
        path: string,
    ): Promise<void> {
        const filtered = floppyFilter.filterAll(
            _.get(data, path),
            permission.attributes,
        );
        _.set(data, path, filtered);
    }

    // async filterByReadPermission(permission, data, path): Promise<void> {
    //     const { roles, resource } = permission;
    //     let readPermission = this.acl.can(roles).readAny(resource);
    //     if (!readPermission.granted) {
    //         readPermission = this.acl.can(roles).readOwn(resource);
    //     }
    //
    //     const filtered = floppyFilter.filterAll(_.get(data, path), readPermission.attributes);
    //     _.set(data, path, filtered);
    // }
}

export default new Authorization();
