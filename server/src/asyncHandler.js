/** Wraps an async Express route handler so any thrown error (including a
 * rejected promise from a DB query) is caught and passed to Express's error
 * middleware, instead of becoming an unhandled promise rejection that
 * crashes the entire Node process. Express 4 does not do this automatically
 * for async handlers — this is the standard workaround.
 *
 * Usage: router.post("/x", asyncHandler(async (req, res) => { ... }));
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
