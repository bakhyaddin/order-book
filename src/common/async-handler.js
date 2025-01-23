export class AsyncHandler {
  static handle(execution) {
    return async (req, res, next) => {
      try {
        await execution(req, res, next);
      } catch (err) {
        next(err);
      }
    };
  }
}
