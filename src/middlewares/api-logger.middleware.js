import { randomUUID } from 'crypto';

import { Logger } from '../common/logger';

export class ApiLogger {
  /**
   * Middleware to log requests
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static requestLogger(req, res, next) {
    req.uuid = randomUUID();
    Logger.info(`[${req.uuid}] Request: ${req.method} ${req.url}`);
    next();
  }

  /**
   * Middleware to log responses
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static responseLogger(req, res, next) {
    const originalSend = res.send;

    res.send = function (body) {
      Logger.info(
        `[${req.uuid}] Response: ${req.method} ${req.url} ${res.statusCode}`
      );
      originalSend.call(this, body);
    };
    next();
  }
}
