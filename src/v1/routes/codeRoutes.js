import express from 'express';
import codeController from '../../controllers/codeController.js';

const router = express.Router();

router
    .get('/create-codes', codeController.createCodesController)
    .post('/send-code', codeController.useCodeController)
    .get('/get-codes', codeController.getCodesController)
    .get('/get-user-logs', codeController.getUserLogController)
    

export default router;
