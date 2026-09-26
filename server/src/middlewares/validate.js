const AppError = require('../utils/AppError');

/**
 * Validate request data against Zod schemas
 * @param {Object} schemas - { body?: ZodSchema, query?: ZodSchema, params?: ZodSchema }
 */
const validate = (schemas) => {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          const errors = result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          }));
          return next(new AppError('Validation Error in request body', 400, errors));
        }
        req.body = result.data;
      }

      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          const errors = result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          }));
          return next(new AppError('Validation Error in query parameters', 400, errors));
        }
        req.query = result.data;
      }

      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          const errors = result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          }));
          return next(new AppError('Validation Error in route parameters', 400, errors));
        }
        req.params = result.data;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = validate;
