const ResponseStatus = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

class ApiResponse {
  constructor(statusCode, message, data = undefined) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  _sanitize(response) {
    const clone = {};
    Object.assign(clone, response);
    for (const i in clone) {
      if (typeof clone[i] === 'undefined') delete clone[i];
    }
    return clone;
  }

  prepare(res, response) {
    return res.status(this.statusCode).json(this._sanitize(response));
  }

  send(res) {
    return this.prepare(res, this);
  }
}

export class SuccessResponse extends ApiResponse {
  constructor(message = 'Success', data) {
    super(ResponseStatus.SUCCESS, message, data);
  }
}

export class CreatedResponse extends ApiResponse {
  constructor(message = 'Created') {
    super(ResponseStatus.CREATED, message);
  }
}

export class BadRequestResponse extends ApiResponse {
  constructor(message = 'Bad Parameters') {
    super(ResponseStatus.BAD_REQUEST, message);
  }
}

export class NotFoundResponse extends ApiResponse {
  constructor(message = 'Not Found') {
    super(ResponseStatus.NOT_FOUND, message);
  }
}

export class InternalErrorResponse extends ApiResponse {
  constructor(message = 'Internal Error') {
    super(ResponseStatus.INTERNAL_ERROR, message);
  }
}
