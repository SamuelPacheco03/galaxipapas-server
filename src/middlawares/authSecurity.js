import jwt from "jsonwebtoken";
import config from "../config.js";

const secret = config.jwt.secret;

// Función para asignar un token JWT
const assignToken = (data, settings) => {
  return jwt.sign(data, secret, settings);
};

// Función para verificar un token JWT
function verifyToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error("Token inválido o expirado");
  }
}

// Middleware para verificar token y roles desde las cookies
const checkAuth = (rolesPermitidos = []) => {
  return (req, res, next) => {
    try {
      // Extraer el token desde las cookies (usando cookie-parser)
      const decoded = decodeTokenFromCookies(req);
      req.user = decoded; // Asignar los datos del usuario al request 
      // Verificar roles si es necesario
      if (rolesPermitidos.length > 0) {
        const userRole = decoded.role_id; // Obtener el rol del usuario desde el token
        if (!rolesPermitidos.includes(userRole)) { // Verificar si el rol del usuario está en la lista de roles permitidos
          throw new Error("Permiso denegado, rol no autorizado");
        }
      }

      // Si el token es válido y los permisos son correctos, continuar
      next();
    } catch (error) {
      res.status(403).json({ message: error.message || "Permiso denegado o no autorizado" });
    }
  };
};

// Extrae el token desde las cookies
function decodeTokenFromCookies(req) {
  const { accessToken } = req.cookies; // Extraer el token de acceso de las cookies
  if (!accessToken) {
    throw new Error("Token no proporcionado en las cookies");
  }

  return verifyToken(accessToken); // Verificar y decodificar el token
}

export default {
  assignToken,
  checkAuth,
};
