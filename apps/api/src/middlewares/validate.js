
import { ZodError } from 'zod';
import { BadRequestError } from '../utils/errors.js';

/**
 * Validates request body, query, or params against a Zod schema.
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    try {
      const data = schema.parse(req[source]);
      // Replace with parsed/coerced data
      if (source === 'body') req.body = data;
      if (source === 'query') (req).validatedQuery = data;
      if (source === 'params') (req).validatedParams = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.');
          if (!details[path]) details[path] = [];
          details[path].push(issue.message);
        }
        next(new BadRequestError('Validation failed', details));
      } else {
        next(error);
      }
    }
  };
}
