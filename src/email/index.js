import nodemailer from "nodemailer";
import config from "../config.js";

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure, 
  auth: {
    user: config.email.auth.user,
    pass: config.email.auth.pass,
  },
});

async function sendEmail({ from, to, subject, text, html }) { 
  try {
      await transporter.sendMail({
      from, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });    
  } catch (error) {
    console.log(error);
    throw new Error('Algo falló en el envío del email');
  }
}

export default sendEmail;
