import ajv from 'ajv';
import { ValidationError } from '../../common/errors';

class Validation {
    private validator: ajv.Ajv;
    constructor() {
        this.validator = new ajv();
    }

    validate(schema: Record<string, unknown>, data: object, strict = true): void {
        const nSchema = schema;

        if (!strict) {
            delete nSchema.required;
        }

        const valid: boolean | PromiseLike<any> = this.validator.validate(
            nSchema,
            data,
        );
        if (!valid) {
            throw new ValidationError(undefined, this.validator.errors);
        }
    }
}

export default new Validation();
