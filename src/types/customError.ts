interface CustomError extends Error{
    code?: number;
    status?: number;
    errors?:unknown;
}
interface ErrorResponse{
    error: string,
    message: string,
}

export type { CustomError, ErrorResponse };
