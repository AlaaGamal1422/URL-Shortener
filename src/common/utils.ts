type Env = 'development' | 'production';
class Utils {
    static inDevelopment(): boolean {
        const env = (process.env.NODE_ENV || 'development') as Env;
        return env === 'development';
    }

    static isObject(obj: unknown): boolean {
        return obj != null && obj.constructor.name === 'Object';
    }

    static parseBoolean(value: string): boolean {
        return /true/i.test(value);
    }

    static parseInt(value: any): number {
        const parsed: number = parseInt(value, 10);
        return Number.isNaN(parsed) ? 0 : parsed;
    }

    /**
     * Merge destination object in src object, and ignore null props
     * @param src
     * @param dest
     * @returns {*}
     */
    static merge(
        src: Record<string, unknown>,
        dest: Record<string, unknown> | any,
    ): Record<string, unknown> {
        if (!this.isObject(src) || !this.isObject(dest)) {
            return src;
        }

        const nSrc = src;
        Object.keys(dest).forEach((k) => {
            const ownProperty: boolean = Object.prototype.hasOwnProperty.call(
                dest,
                k,
            );
            if (!ownProperty) {
                return;
            }

            if (dest[k] != null) {
                nSrc[k] = dest[k];
            }
        });

        return nSrc;
    }
}

export default Utils;
