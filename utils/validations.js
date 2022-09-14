require('dotenv').config({ path: '/Users/qurhealthwork/personal/TrackMyTransactions/utils/.env' });
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');

function isEmail(email) {
    var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (email !== '' && email.match(emailFormat)) {
        console.log("is valid email");
        return true;
    }
    else {
        console.log("is not valid email");
        return false;
    }
}

function getJWTForUser(id) {
    try {
        return jwt.sign({ userId: id }, process.env.jwtKey);
    } catch (error) {
        return null;
    }
}

function verifyJWT(token) {
    try {
        const decoded = jwt.verify(token, process.env.jwtKey);
        return decoded.userId;
    } catch (error) {
        console.log(error);
        return null;
    }
}

function generateRandomNumber() {
    var minm = 100000;
    var maxm = 999999;
    return Math.floor(Math
        .random() * (maxm - minm + 1)) + minm;
}



async function sendMail(email, otp) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.Mail_USER,
            pass: process.env.Mail_PASSWORD,
        },
    });

    let info = await transporter.sendMail({
        from: process.env.Mail_USER,
        to: email,
        subject: "Please verify your device",
        text: "Your otp is " + otp,

    });
    // if (info.accepted.cnt > 0) {
    return true;
    // } else {
    //     return false;
    // }

}

module.exports = {
    isEmail,
    generateRandomNumber,
    sendMail,
    getJWTForUser,
    verifyJWT,

};