import { AppConfig } from '../configs/app.config';
import {
  InternalErrorResponse,
  NotFoundResponse,
  BadRequestResponse,
} from './api-response';

const ErrorType = {
  INTERNAL: 'InternalError',
  NOT_FOUND: 'NotFoundError',
  BAD_REQUEST: 'BadRequestError',
};

export class ApiError extends Error {
  type = undefined;
  constructor(type, message = 'error') {
    super(message);
    this.type = type;
  }

  static handle(err, res) {
    switch (err.type) {
      case ErrorType.INTERNAL:
        return new InternalErrorResponse(err.message).send(res);
      case ErrorType.NOT_FOUND:
        return new NotFoundResponse(err.message).send(res);
      case ErrorType.BAD_REQUEST:
        return new BadRequestResponse(err.message).send(res);
      default: {
        let message = err.message;
        if (AppConfig.nodeEnvironment === 'production')
          message = 'Something wrong happened.';
        return new InternalErrorResponse(message).send(res);
      }
    }
  }
}

export class InternalError extends ApiError {
  constructor(message = 'Internal error') {
    super(ErrorType.INTERNAL, message);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request') {
    super(ErrorType.BAD_REQUEST, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not Found') {
    super(ErrorType.NOT_FOUND, message);
  }
}
