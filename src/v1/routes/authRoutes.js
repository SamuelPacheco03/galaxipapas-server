import express from 'express';
import authController from '../../controllers/authController.js';

const router = express.Router();

router
    .post('/sign-in', authController.loginController)
    .post('/register', authController.registerController)
    .post('/register-admin', authController.registerControllerAdmin)
    .get('/me', authController.verifySession)
    .get('/logout', authController.logout)
    // .post('/forgot-password', authController.forgotPassword)
    // .post('/how-to-reset-password', authController.howToResetPasswordController)
    // .post('/forgot-password-phone', authController.forgotPasswordPhone)
    // .post('/reset-password', authController.resetPassword)

export default router;
