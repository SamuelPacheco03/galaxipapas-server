import { parsePhoneNumberFromString } from "libphonenumber-js";
import sendEmail from "../email/index.js";
import sms from "../sms/index.js";
import config from "../config.js";
import validator from "validator";
import db from "../db/mongodb.js";

const resetPasswordTime = async (req, next) => {
  const table_auth = "auth";

  try {
    const column = "user";
    const user = req.body.user;
    console.log(user);
    const checkUser = await db.query(table_auth, user);
    var data = { resetPassword: 1 };

    if (!checkUser) {
      throw new Error("Hubo un error");
    }

    if (checkUser.resetPassword == 1) {
      throw new Error(
        "Ya se ha enviado un correo a este usuario, por favor espera un momento para reenviar."
      );
    }

    await db.update(table_auth, data, user, column);

    setTimeout(async () => {
      data = { resetPassword: 0 };
      await db.update(table_auth, data, user, column);
    }, 10000);

    return checkUser;
  } catch (error) {
    next(error);
  }
};

const validatePhoneNumber = (phoneNumber) => {
  const parsedNumber = parsePhoneNumberFromString(phoneNumber);
  if (parsedNumber) {
    const isValid = parsedNumber.isValid();
    if (!isValid) {
      throw new Error("El número no es válido");
    }
    return {
      number: parsedNumber.formatInternational(),
      short_number: parsedNumber.nationalNumber,
    };
  } else {
    throw new Error("El número no es válido");
  }
};

const validateEmail = (email) => {
  if (!validator.isEmail(email) && validator.contains(email, " ")) {
    throw new Error("El correo electrónico es válido.");
  }
  return true
};

function generateRandomNumber() {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join(
    ""
  );
}

async function sendMessage(typeMessage, client, subject, text) {
  try {
    switch (typeMessage) {
      case "email":
        const email = client.email;
        await sendEmail({
          from: config.email.user,
          to: email,
          subject: subject,
          text,
        });
        break;

      case "sms":
        const phone = client.phone;
        const body = text;
        await sms(body, phone);
        break;

      case "whatsapp":
        const phoneWsp = client.phone;
        const bodyWsp = text;

        break;

      default:
        throw new Error("El tipo de envío de mensaje es erróneo.");
    }
  } catch (error) {
    console.log(error)
  }
}

const send2FACode = async (user, deliveryMethod, method) => {
  const verificationCode = generateRandomNumber();
  switch (deliveryMethod) {
    case "email":
      await sendEmail({
        from: config.email.user,
        to: method,
        subject: "Código de Verificación",
        text: `Hola ${user}, tu código de ingreso es ${verificationCode}`,
      });
      break;

    case "sms":
      const smsBody = `Hola ${user}, tu código de ingreso es ${verificationCode}`;
      await sms(smsBody, method);
      break;

    default:
      throw new Error("Método de entrega no soportado.");
  }
  

  // Almacena el código temporalmente en la base de datos
  user.temp2FACode = code;
  await db.saveUser(user);
};

export default {
  resetPasswordTime,
  validatePhoneNumber,
  validateEmail,
  generateRandomNumber,
  sendMessage,
  send2FACode
};
