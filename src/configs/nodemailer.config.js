import nodemailer from 'nodemailer'
import { environments } from './env.config.js'

const port = Number(environments.MAIL_PORT)
const transporter = nodemailer.createTransport({
  host: environments.MAIL_HOST,
  port,
  secure: port === 465, // true for 465, false for other ports
  auth: {
    user: environments.SMTP_USER,
    pass: environments.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
})

export const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"CRM Mini" <${environments.SMTP_USER}>`,
      to,
      subject,
      html,
      text: html ? undefined : subject
    })
    return { success: true, info: { accepted: info.accepted, rejected: info.rejected, response: info.response, messageId: info.messageId } }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
