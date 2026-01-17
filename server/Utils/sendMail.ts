import nodemailer, { Transporter } from 'nodemailer'
import ejs from 'ejs'
import path from 'path'
require('dotenv').config()

/**
 * EMAIL SERVICE
 * -------------
 * Uses "Connection Pooling" to keep a few email connections open and ready.
 * This makes sending emails much faster because we don't log in every single time.
 */

// 1. Transporter
// Global scope ensures we only create the pool once.
const transporter: Transporter = nodemailer.createTransport({
    pool: true,             // Use existing connections (don't log in every time)
    maxConnections: 5,      // Keep 5 trucks ready
    maxMessages: 100,       // Each truck does 100 trips before reloading
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

/**
 * Defines the "Payload" (Cargo) for our email.
 * @property email - Who is receiving it?
 * @property subject - What is the title?
 * @property template - Which HTML file design to use?
 * @property data - The actual information (Name, Link, etc.) to put inside the email.
 */
interface EmailOptions {
    email: string;
    subject: string;
    template: string;
    data: { [key: string]: any }
}

/**
 * Sends an email using a pre-made HTML template.
 * @param options - The email details (Payload).
 */
const sendMail = async (options: EmailOptions): Promise<void> => {
    const { email, subject, template, data } = options

    // Get the full path to the template file on your hard drive
    const templatePath = path.join(__dirname, '../mails', template)

    // Merge the "Payload" (data) into the HTML template
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