import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body) as T;
      next();
    } catch (err) {
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

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      Object.assign(req, { query: schema.parse(req.query) });
      next();
    } catch (err) {
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
