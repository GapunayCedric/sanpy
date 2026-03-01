import { ZodError } from 'zod';
export function validateBody(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (err) {
            if (err instanceof ZodError) {
                res.status(400).json({
                    message: 'Validation failed',
                    errors: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
                });
                return;
            }
            next(err);
        }
    };
}
export function validateQuery(schema) {
    return (req, res, next) => {
        try {
            Object.assign(req, { query: schema.parse(req.query) });
            next();
        }
        catch (err) {
            if (err instanceof ZodError) {
                res.status(400).json({
                    message: 'Invalid query parameters',
                    errors: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
                });
                return;
            }
            next(err);
        }
    };
}
