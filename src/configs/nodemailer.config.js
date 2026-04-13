import nodemailer from 'nodemailer'
import { environments } from './env.config.js'

export const transporter = nodemailer.createTransport({
  host: environments.MAIL_HOST,
  port: Number(environments.MAIL_PORT),
  secure: false,
  auth: {
    user: environments.SMTP_USER,
    pass: environments.SMTP_PASS
  }
})

export const sendMail = async (to, subject, html) => {
  const info = await transporter.sendMail({
    from: `"CRM Mini" <${environments.SMTP_USER}>`,
    to,
    subject,
    html
  })

  return info
}
