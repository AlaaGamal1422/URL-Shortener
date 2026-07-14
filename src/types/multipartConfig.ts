export interface MultipartField{
    name: string,
    maxCount?: number | undefined,
    size?: number | undefined,
    ext?: string[] | undefined
} 

export interface MultipartConfig{
    parseBody?: boolean;
    fileSize?: number;
    fields?: Record<string,MultipartField>;
}

export interface MultrError{
    code?: string;
    field?: string;
}