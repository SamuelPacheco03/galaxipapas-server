import serviceAtuh from "../services/authService.js";
import { success } from "../red/response.js";
import auth from "../auth/index.js";

const loginController = async (req, res, next) => {
  try {
    const { ...credentials } = req.body; // Obtener "recordarme" y credenciales
    console.log(credentials)
    const result = await serviceAtuh.authenticateUser(credentials);
    console.log(result)
    const refreshToken = auth.assignRefreshToken({ user: result.userInfo });

    const accessTokenOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      // domain: 'https://galaxipapas.vercel.app',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    };

    const refreshTokenOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      // domain: 'https://galaxipapas.vercel.app',
      maxAge:  7 * 24 * 60 * 60 * 1000, 
    };

    // Establecer cookies seguras con el token de acceso
    res.cookie("accessToken", result.token, accessTokenOptions);
    console.log(res.cookie)
    // Establecer cookies seguras con el refresh token
    res.cookie("refreshToken", refreshToken, refreshTokenOptions);
    // Enviar respuesta de éxito
    success(
      req,
      res,
      {
        session: result.session,
        user: result.userInfo
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

const registerController = async (req, res, next) => {
  try {
    console.log(req.body);
    const data = await serviceAtuh.registerUser(req.body);
    success(req, res, data, 200);
  } catch (error) {
    console.log(error)
    next(error);
  }
};

const registerControllerAdmin = async (req, res, next) => {
  try {
    console.log(req.body);
    const data = await serviceAtuh.registerUserAdmin(req.body);
    success(req, res, data, 200);
  } catch (error) {
    console.log(error)
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const result = await serviceAtuh.verifySession(req);
    res.cookie("accessToken", result.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 15 * 60 * 1000, // Token de acceso dura 15 minutos
    });
  
    success(
      req,
      res,
      {
        session: result.session,
        rol: result.rol,
        doubleAuthRequired: false,
        onlyOneMethod: false,
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

const verifySession = async (req, res, next) => {
  try {
    const result = await serviceAtuh.verifySession(req);
    success(req, res, {
      session: result.session,
      user: result.userInfo
    }, 200);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const result = await serviceAtuh.logout(req);

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'None',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'None',

    });

    success(req, res, result, 200);
  } catch (error) {
    next(error);
  }
};

// const forgotPassword = async (req, res, next) => {
//   try {
//     const result = await serviceAtuh.forgotPassword(req.body);
//     success(req, res, result, 200);
//   } catch (error) {
//     next(error);
//   }
// };

// const howToResetPasswordController = async (req, res, next) => {
//   try {
//     const result = await serviceAtuh.howToResetPassword(req.user, req.body);
//     success(req, res, result, 200);
//   } catch (error) {
//     next(error);
//   }
// };

// const forgotPasswordPhone = async (req, res, next) => {
//   try {
//     const result = await serviceAtuh.forgotPasswordPhone(req.user, req.body);
//     success(req, res, result, 200);
//   } catch (error) {
//     next(error);
//   }
// };

// const resetPassword = async (req, res, next) => {
//   try {
//     const result = await serviceAtuh.resetPassword(req.user, req.body);
//     success(req, res, result, 200);
//   } catch (error) {
//     next(error);
//   }
// };

export default {
  loginController,
  registerController,
  refreshToken,
  verifySession,
  logout,
  registerControllerAdmin
  //   forgotPassword,
  //   howToResetPasswordController,
  //   forgotPasswordPhone,
  //   resetPassword,
};
