import { validationResult } from 'express-validator';

import { BadRequestError } from '../common/api-error';

export class ValidationMiddleware {
  /**
   * Request validator
   * @param {any} validations
   */
  static handle(validations) {
    return async (req, res, next) => {
      try {
        await Promise.all(validations.map((validation) => validation.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          const messageArray = errors.array();
          return next(new BadRequestError(messageArray.map((msg) => msg.msg)));
        }
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}
