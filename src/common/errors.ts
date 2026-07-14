// eslint-disable-next-line max-classes-per-file
import { CustomError,ErrorResponse } from '../types/customError';
class BaseError extends Error  implements CustomError{
    constructor(
        public code: number = 0,
        public name: string = 'UnexpectedError',
        public status: number = 500,
        public message: string = 'Internal server error',
    ) {
        super(message);

        this.code = code;
        this.name = name;
        this.status = status;
        this.message = message;
    }

    toJson(): ErrorResponse {
        return {
            error: this.name,
            message: this.message,
        };
    }
}

class NotFoundError extends BaseError {
    constructor(message: string = 'Error 404') {
        super(0, 'NotFoundError', 404, message);
    }
}

class UnauthenticatedError extends BaseError {
    constructor(message: string = 'Authentication failed') {
        super(0, 'UnauthenticatedError', 403, message);
    }
}

class UnauthorizedError extends BaseError {
    constructor(message: string = 'Unauthorized Access') {
        super(0, 'UnauthorizedError', 401, message);
    }
}

class ValidationError extends BaseError {
    constructor(
        message: string = 'Bad Request',
        public errors?: unknown,
    ) {
        super(0, 'ValidationError', 400, message);
        this.errors = errors;
    }
}

class MethodNotImplementedError extends BaseError {
    constructor(message: string = 'Method Not Implemented') {
        super(0, 'MethodNotImplementedError', 500, message);
    }
}

class UnexpectedError extends BaseError {
    constructor(message: string = 'Unexpected Error') {
        super(0, 'UnexpectedError', 500, message);
    }
}
class ExpiredUrl extends BaseError {
    constructor(message: string = 'Expired Url') {
        super(0, 'UrlError', 410, message);
    }
}
export {
    BaseError,
    UnauthenticatedError,
    UnauthorizedError,
    ValidationError,
    NotFoundError,
    MethodNotImplementedError,
    UnexpectedError,
    ExpiredUrl,
};
