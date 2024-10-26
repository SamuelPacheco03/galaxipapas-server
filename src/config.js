import dotenv from 'dotenv';

dotenv.config();

export default {
    app:{
        port:process.env.PORT || 4000,
    },

    jwt:{
        secret: process.env.JWT_SECRET || 'secretnote',
        expiration: process.env.JWT_EXPIRATION || '7d',
        passwordExpiration: process.env.JWT_PASSWORDEXPIRATION || '15min',
        cookie_expires: process.env.JWT_COOKIE_EXPIRES || 1,
        dbAuthExpiration: process.env.JWT_AUTHEXPIRATION ||'15min'
    },

    mongodb:{
        host : process.env.MONGODB_HOST || 'localhost',
        port : process.env.MONGODB_USER || 27017,
        database : process.env.MONGODB_DB || 'galaxy_papas_dbgalaxy_papas_db',
        user : process.env.MONGODB_USER || 'root',
        password : process.env.MONGODB_PASSWORD || '',
    },
    
    email:{
        user: process.env.EMAIL_USER || "samuel2003pacheco@gmail.com",
        host: process.env.EMAIL_HOST || "",
        port: process.env.EMAIL_PORT || 465,
        secure: process.env.EMAIL_SECURE || false, // Use `true` for port 465, `false` for all other ports
        auth: {
          user:process.env.EMAIL_AUTH_USER || "",
          pass:process.env.EMAIL_AUTH_PASSWORD || "",
        }
    },

    sms:{
        account_sid: process.env.TWILIO_ACCOUNT_SID || '',
        account_auth: process.env.TWILIO_ACCOUNT_AUTH || ''
    }
}