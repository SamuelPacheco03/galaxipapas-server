import twilio from 'twilio';
import config from '../config.js';

const client = twilio(config.sms.account_sid, config.sms.account_auth);

const sms = async (body, to) =>{
    try {
        client.messages.create({
            body,
            from:'+12563636551',
            to
        })
    } catch (error) {
        console.log(error);
        throw new Error ('Hubo un error enviando el sms');
    }
}

export default sms