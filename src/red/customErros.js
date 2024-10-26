class AuthError extends Error {
    constructor(message, statusCode = 400) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  
  class NotFoundError extends Error {
    constructor(message = 'Recurso no encontrado') {
      super(message);
      this.statusCode = 404;
    }
  }
  
  class ValidationError extends Error {
    constructor(message = 'Datos inválidos') {
      super(message);
      this.statusCode = 400;
    }
  }
  
  export { AuthError, NotFoundError, ValidationError };
  