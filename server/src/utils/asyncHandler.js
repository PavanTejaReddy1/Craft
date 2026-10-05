/**
 * Wraps an async route handler so any thrown error is forwarded to next().
 * This is needed because ES module `import` hoisting means express-async-errors
 * cannot reliably patch Express when using ESM.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
