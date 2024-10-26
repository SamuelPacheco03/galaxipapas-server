import bcrypt from "bcryptjs";
import config from "../config.js";
import auth from "../auth/index.js";
import db from "../db/mongodb.js";
import sendEmail from "../email/index.js";
import sms from "../sms/index.js";
import utils from "../utils/index.js";
import User from "../models/User.js";
import UserInfo from '../models/UserInfo.js';
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "../red/customErros.js";
import { success } from "../red/response.js";

const USERS_TABLE = "users";
const ROLES_TABLE = "roles";
const AUTH_TABLE = "auth";
const USER_INFO_TABLE = "user_personal_info";
const SALT_ROUNDS = 5;
const salt = await bcrypt.genSalt(SALT_ROUNDS);
const { assignToken } = auth;

const findUser = async (normalizedUser) => {
  const foundUser = await db.oneByUser(USERS_TABLE, normalizedUser);
  return foundUser;
};

const authenticateUser = async (credentials) => {
  const { username, password } = credentials;

  // Verificar si los datos son correctos
  if (!username || !password) {
    throw new ValidationError("Por favor ingrese usuario y contraseña.");
  }

  const normalizedUser = username.trim().toLowerCase();
  try {
    // Buscar usuario por nombre de usuario
    const foundUser = await User.findOne({ email: normalizedUser });

    if (!foundUser) {
      throw new NotFoundError("Usuario o contraseña incorrectos.");
    }

    // Validar la contraseña
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      throw new AuthError("Usuario o contraseña incorrectos.", 401);
    }

    // Generar token y retornar datos
    const user = foundUser;
    const user_id = foundUser._id;

    // Si el usuario es admin, omitir búsqueda en UserInfo
    let userInfo;
    if (foundUser.rol === 'admin') {
      userInfo = {
        email: user.email,
        rol: user.rol,
      };
    } else {
      // Buscar información adicional solo para usuarios no admin
      const foundUserInfo = await UserInfo.findOne({ user_id });
      userInfo = {
        name: foundUserInfo.name,
        birthdate: foundUserInfo.birthdate,
        document_number: foundUserInfo.document_number,
        phone: foundUserInfo.phone,
        city: foundUserInfo.city,
        email: user.email,
        rol: user.rol,
      };
    }

    const token = assignToken(
      {
        user: normalizedUser,
        user_id,
        rol: foundUser.rol,
      },
      { expiresIn: config.jwt.expiration }
    );

    const session = true; // Indica que la sesión está activa

    return { token, session, userInfo };
  } catch (error) {
    console.log(error);
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof AuthError
    ) {
      throw error;
    }

    throw new AuthError(
      "Hubo un problema al iniciar sesión. Verifique sus datos.",
      error.statusCode || 500
    );
  }
};


const verifySession = async (req) => {
  const { user } = req;
  const username = user.user;
  const foundUser = await User.findOne({ email: username });

  if (!foundUser) {
    throw new NotFoundError("Usuario no encontrado.");
  }

  const session = true; // Indica que la sesión está activa
  const user_id = foundUser._id;

  // Si el usuario es admin, omitir búsqueda en UserInfo
  let userInfo;
  if (foundUser.rol === 'admin') {
    userInfo = {
      email: foundUser.email,
      rol: foundUser.rol,
    };
  } else {
    // Buscar información adicional solo para usuarios no admin
    const foundUserInfo = await UserInfo.findOne({ user_id });
    userInfo = {
      name: foundUserInfo.name,
      birthdate: foundUserInfo.birthdate,
      document_number: foundUserInfo.document_number,
      phone: foundUserInfo.phone,
      city: foundUserInfo.city,
      email: foundUser.email,
      rol: foundUser.rol,
    };
  }

  return { session, userInfo };
};


const logout = async (req) => {
  // Elimina las cookies del cliente

  req.res.clearCookie("accessToken");

  req.res.clearCookie("refreshToken");
  return { session: false };
};

const registerUser = async (userData) => {
  const { password, email, rol, name, birthdate, document_number, phone, city } = userData;

  // Verificar si la información es completa
  if (!password || !email || !name || !birthdate || !document_number || !phone || !city) {
    throw new Error("Información incompleta.");
  }

  // Verificar si el correo ya está registrado
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("El correo electrónico ya está en uso.");
  }

  // Verificar si el número de documento ya está registrado
  const existingDocument = await UserInfo.findOne({ document_number });
  if (existingDocument) {
    throw new Error("El número de documento ya está en uso.");
  }

  // Validar el correo electrónico
  const validEmail = utils.validateEmail(email);
  if (!validEmail) {
    throw new Error("Correo electrónico inválido.");
  }

  // Hash de la contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    // Crear el usuario
    const newUser = new User({
      email,
      password: hashedPassword,
      rol,
    });

    // Guardar el usuario en la base de datos
    const createdUser = await newUser.save();

    // Crear la información adicional del usuario (UserInfo)
    const newUserInfo = new UserInfo({
      name,
      birthdate,
      document_number,
      phone,
      city,
      user_id: createdUser._id,
    });

    // Guardar la información adicional del usuario
    await newUserInfo.save();

    return { message: "Usuario registrado con éxito.", success: true };
  } catch (error) {
    console.log(error);
    throw new Error("Error al crear el usuario.");
  }
};


const registerUserAdmin = async (userData) => {
  const { password, email, rol } = userData;
  console.log(rol)
  // Verificar si la información es completa
  if (!password || !email ) {
    throw new Error("Información incompleta.");
  }
  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("El correo electrónico ya está en uso.");
  }

  // Validar el correo electrónico
  const validEmail = utils.validateEmail(email);
  if (!validEmail) {
    throw new Error("Correo electrónico inválido.");
  }

  // Hash de la contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    // Crear el usuario
    const newUser = new User({
      email,
      password: hashedPassword,
      rol,
    });

    // Guardar el usuario en la base de datos
    const createdUser = await newUser.save();

    return { message: "Usuario registrado con éxito.", success:true };
  } catch (error) {
    console.log(error)
    throw new Error("Error al crear el usuario.");
  }
};

const handleForgotPassword = async (body) => {
  const { user } = body;

  const foundUser = await db.query(USERS_TABLE, user);
  if (!foundUser) {
    throw new Error("Usuario no encontrado.");
  }

  const token = assignToken(
    {
      user: foundUser.user,
      email: foundUser.email,
      phone: foundUser.phone,
      forgotPassword: true,
    },
    { expiresIn: config.jwt.expiration }
  );

  return token;
};

const sendPasswordResetLink = async (userData, body) => {
  const { user, email, phone, forgotPassword } = userData;
  const deliveryMethod = body.type;

  if (!forgotPassword) {
    throw new Error("Acceso denegado.");
  }

  const resetToken = assignToken(
    { user, resetPassword: true },
    { expiresIn: config.jwt.dbAuthExpiration }
  );

  const passwordResetUrl = `http://localhost:5173/reset-password/${resetToken}`;

  switch (deliveryMethod) {
    case "email":
      await sendEmail({
        from: config.email.user,
        to: email,
        subject: "Restablecimiento de Contraseña",
        text: `Hola ${user}, haz click en el enlace para restablecer tu contraseña: ${passwordResetUrl}`,
      });
      return { resetByPhone: false };

    case "sms":
      const resetCode = utils.generateRandomNumber();
      const smsBody = `Hola ${user}, tu código de restablecimiento es ${resetCode}`;
      await sms(smsBody, phone);
      return { token: resetToken, resetByPhone: true };

    default:
      throw new Error("Método de entrega no soportado.");
  }
};

const verifyResetCodeAndSendLink = async (verificationData, body) => {
  const { code, user } = verificationData;
  const { sentCode } = body;

  if (code.toString() !== sentCode.toString()) {
    throw new Error("Los códigos no coinciden.");
  }

  const resetToken = assignToken(
    { user, resetPassword: true },
    { expiresIn: config.jwt.passwordExpiration }
  );

  return { resetUrl: `/reset-password/${resetToken}` };
};

const resetPassword = async (userData, body) => {
  const { user, resetPassword } = userData;
  const { newPassword } = body;

  if (!resetPassword) {
    throw new Error("Acceso denegado.");
  }

  const foundUser = await db.query(USERS_TABLE, user);
  if (!foundUser) {
    throw new Error("Usuario no encontrado.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, salt);
  await db.update(AUTH_TABLE, { password: hashedPassword }, user, "user");

  return { message: "Contraseña actualizada exitosamente." };
};

export default {
  authenticateUser,
  registerUser,
  verifySession,
  registerUserAdmin,
  logout,
  handleForgotPassword,
  sendPasswordResetLink,
  verifyResetCodeAndSendLink,
  resetPassword,
};
