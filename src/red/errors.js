import { error } from './response.js';

function errors(err, req, res, next) {
  console.error('[error]', err);

  // Verificar si el error tiene un statusCode personalizado
  const message = err.message || 'Error interno';
  const status = err.statusCode || 500;

  error(req, res, message, status);
}

export default errors;
