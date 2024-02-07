
const sendMail = require("nodemailer");

const options = {
    service: process.env.SERVICE,
    auth: {
        user: process.env.SENDER,
        pass: process.env.PASSWORD
    }
}; 


const send = sendMail.createTransport(options);

module.exports = {send};