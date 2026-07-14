import jwt, { VerifyErrors, JwtPayload } from 'jsonwebtoken';
import { AccessTokenPayload, VerifyErrorsWithCode } from '../types/jwt';
import {tragetedConfigurations} from '../config';
import { UnauthorizedError } from './errors';

// make sure is it become string
const { local } = tragetedConfigurations.authentication;

class Crypto {
    static async createJwtToken(data: AccessTokenPayload): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.sign(
                data,
                local.key,
                (err: Error | null, token?: string): void => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(token!);
                },
            );
        });
    }

    static async createJwtTokenWithExpiration(
        signObj: AccessTokenPayload,
        timeoutMs: number = 0,
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            const cSignObject = { ...signObj };
            const currentTime: number = new Date(Date.now()).getTime() / 1000;
            const expireAfter = timeoutMs / 1000;
            cSignObject.exp = currentTime + expireAfter;

            jwt.sign(
                cSignObject,
                local.key,
                (err: Error | null, token?: string): void => {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(token!);
                },
            );
        });
    }

    static async verifyJwtToken(token: string): Promise<AccessTokenPayload> {
        return new Promise((resolve, reject) => {
            jwt.verify(
                token,
                local.key,
                (err: VerifyErrors | null, decoded?: JwtPayload | string) => {
                    if (!err) {
                        return resolve(decoded as AccessTokenPayload);
                    }
                    const verifyError = err as VerifyErrorsWithCode;
                    let errorCode: number | undefined;
                    let errorMsg: string | undefined;
                    if (verifyError.name === 'TokenExpiredError') {
                        errorCode = 101;
                        errorMsg = 'Token has been expired';
                    } else if (verifyError.name === 'JsonWebTokenError') {
                        errorMsg = 'Invalid authorization token';
                    }

                    // need to add the custom err interface
                    const error = new UnauthorizedError(
                        errorMsg || verifyError.message,
                    );
                    error.code = errorCode ?? verifyError.code ?? error.code;

                    return reject(error);
                },
            );
        });
    }
}

export default Crypto;
