import { ApiError, InternalError } from '../common/api-error';
import { Logger } from '../common/logger';

export class ErrorHandler {
  /**
   * Error handling middleware
   * @param {Error} err
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static handle(err, req, res, next) {
    Logger.error(err);
    if (err instanceof ApiError) {
      ApiError.handle(err, res);
    } else {
      ApiError.handle(new InternalError(err.message), res);
    }
  }
}
