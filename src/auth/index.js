import jwt from "jsonwebtoken";
import config from "../config.js";
import db from "../db/mongodb.js";

const secret = config.jwt.secret;

const assignToken = (data, settings) => {
  return jwt.sign(data, secret, settings);
};

const assignRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

function verifyToken(token) {
  return jwt.verify(token, secret);
}

const checkToken = {
  confirmToken: function (req) {
    const decode = decodeHeader(req);

    // if(id){
    //     if(decode.id !== id){
    //         throw new Error('No puedes hacer esto')
    //     };
    // };
    return decode;
  },

  confirmPermission: function (req) {
    const decode = decodeHeader(req);
    console.log(decode)
    if (decode.role !== 1) {
      throw new Error("No puedes hacer esto");
    }
    return decode;
  },

  confirmPermissionRol: async function (req, id_product) {
    const decode = decodeHeader(req);
    const myRol = decode.role;
    const product = await db.queryProduct("products", id_product);
    if (!product) {
      throw new Error("Hubo un error");
    };

    const id_process = product[0].process;
    const rol_process = await db.queryRoles("roles_processes", id_process);
    const rol = rol_process[0].id_role;
    console.log('holaaaa')
    console.log(myRol, rol)
    if (myRol !== rol) {
      throw new Error("No puedes hacer esto");
    };
    
    return decode;
  },
};

function getToken(authorization) {
  if (!authorization) {
    throw new Error("No viene token");
  }

  if (authorization.indexOf("Bearer") === -1) {
    throw new Error("Formato inválido");
  }

  let token = authorization.replace("Bearer ", "");
  return token;
}

function decodeHeader(req) {
  const authorization = req.headers.authorization || "";
  const token = getToken(authorization);
  const decode = verifyToken(token);

  req.user = decode;
  return decode;
}

export default {
  assignToken,
  checkToken,
  assignRefreshToken
};
