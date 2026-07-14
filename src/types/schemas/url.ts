export interface Url {
    shortCode: string;
    originalUrl: string;
    shortUrl?: string;
    expiresAt: Date;
    visits:number
    createdAt: Date;
    updatedAt: Date;
}