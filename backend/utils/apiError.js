class ApiError extends Error {
  constructor(message = 'Something went wrong', statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(message, 400, errors);
  }

  static unauthorized(message = 'Unauthorized access') {
    return new ApiError(message, 401);
  }

  static forbidden(message = 'Forbidden: Access denied') {
    return new ApiError(message, 403);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(message, 404);
  }

  static conflict(message = 'Conflict: Resource already exists') {
    return new ApiError(message, 409);
  }

  static internal(message = 'Internal Server Error') {
    return new ApiError(message, 500);
  }
}

module.exports = ApiError;
