import express from 'express';
import config from './config.js';
import errors from './red/errors.js';
import cors from 'cors';
import v1AuthRoutes from './v1/routes/authRoutes.js';
import v1CodeRoutes from './v1/routes/codeRoutes.js';

import authSecurity from './middlawares/authSecurity.js';
import cookieParser from 'cookie-parser';

const app = express();

//Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,               
  }));
app.use('/api/v1/auth/me', authSecurity.checkAuth());
app.use('/api/v1/auth/logout', authSecurity.checkAuth());
app.use('/api/v1/code/send-code', authSecurity.checkAuth());
app.use('/api/v1/code/get-codes', authSecurity.checkAuth());
app.use('/api/v1/code/get-user-logs', authSecurity.checkAuth());



//Setting
app.set('port', config.app.port);

// routes
app.use('/api/v1/auth', v1AuthRoutes);
app.use('/api/v1/code', v1CodeRoutes);


app.use(errors);
export default app;

