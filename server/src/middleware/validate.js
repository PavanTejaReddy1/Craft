import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/response.js';

/**
 * Runs after express-validator chains.
 * Returns 422 with structured errors if validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path || e.param,
      message: e.msg,
    }));
    return errorResponse(res, 'Validation failed', 422, formatted);
  }
  next();
};

export default validate;
