declare module 'floppy-filter' {
    const floppyFilter: {
        filterAll(data: unknown, attributes: string[]): unknown;
    };
    export default floppyFilter;
}
