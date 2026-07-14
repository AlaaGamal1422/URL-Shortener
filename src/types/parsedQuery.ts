export interface ParsedQuery {
    page: number;
    limit: number;
    projection: Record<string, 0 | 1>;
    sort: Record<string, -1 | 1>;
    [key: string]: unknown;
}

export interface ParsedQueryWithFilter {
    page: string | string[] | undefined;
    limit: string | string[] | undefined;
    query: {};
    parsedFilter: {};
    [key: string]: unknown;

}
