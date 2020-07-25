const pug = require('pug');
const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from =
            process.env.NODE_ENV === 'production' ?
            process.env.EMAIL_FROM :
            `Omokugbo Joseph Boro <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            //Create transporter for SendGrid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SEND_GRID_USERNAME,
                    pass: process.env.SEND_GRID_PASSWORD,
                },
            });
        }

        //Create a transporter for MailTrap
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    //Send the actual email
    async send(template, subject) {
        //Render the html for the email based on a pug template
        const html = pug.renderFile(
            `${__dirname}/../views/emails/${template}.pug`, { firstName: this.firstName, url: this.url, subject }
        );

        //Define the email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html),
        };

        //Create a transport and send email

        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset() {
        await this.send(
            'passwordReset',
            'Your password reset token. Expires after 10 minutes'
        );
    }
};