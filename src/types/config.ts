export interface AppConfig {
    api: {
        name: string;
        version: string;
        host: string;
        port: string | number;
    };
    common: {
        pageSize: number;
        maxPageSize: number;
    };
    locales: {
        dataPath: string;
        dataExtension: string;
        supportedLocales: string[];
    };
    authentication: {
        local: {
            issuer: string;
            key: string;
        };
    };
}
