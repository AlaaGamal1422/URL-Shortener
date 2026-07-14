import { VerifyErrors, JwtPayload } from 'jsonwebtoken';


interface ErrorPayload{
    code?: number,
    name?: string,
    message?: string,
    details?:unknown,
    stack?:string
}
interface AccessTokenPayload extends JwtPayload {
    name:string;
    userId?: number;
    role?: string;
    cid: string;
    exp?: number;
}

type VerifyErrorsWithCode = VerifyErrors & {
    code?: number;
};

interface User {
    // id?: number;
    roles: string;
}
export type {  User, ErrorPayload, AccessTokenPayload, VerifyErrorsWithCode };
