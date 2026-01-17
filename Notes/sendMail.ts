import nodemailer, { Transporter } from 'nodemailer'
import ejs from 'ejs'
import path from 'path'
require('dotenv').config()

/**
 * GLOBAL EMAIL TRANSPORTER (Singleton Pattern)
 * --------------------------------------------
 * * @description
 * Initializes the Nodemailer transporter with connection pooling.
 * * @logic_change
 * - EARLIER (Local Scope): We created this inside the function. 
 * Result: Every email triggered a new server handshake (approx 1-2s latency).
 * Risk: Gmail could block us for too many login attempts.
 * * - NOW (Global Scope): We initialize this ONCE when the server starts.
 * Result: Reuses existing connections (Pooling). Zero latency for subsequent emails.
 * Benefit: Handles high traffic (like 100 students registering at once) without crashing.
 * * @see https://nodemailer.com/smtp/pooled/
 */
const transporter = nodemailer.createTransport({ ... });

interface EmailOptions {
    email: string;
    subject: string;
    template: string;
    data: { [key: string]: any }
}

const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,

    },
});

const sendMail = async (options: EmailOptions): Promise<void> => {
    const { email, subject, template, data } = options

    // get path to the email template file
    const templatePath = path.join(__dirname, '../mails', template)

    // Render the email template with ejs 
    const html: string = await ejs.renderFile(templatePath, data)

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject,
        html,
    }

    await transporter.sendMail(mailOptions)
}

export default sendMail;