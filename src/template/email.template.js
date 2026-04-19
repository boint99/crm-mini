import { sendMail } from '../configs/nodemailer.config.js'

/**
 * @param {object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.title        - Tiêu đề trong email
 * @param {string} options.body         - Nội dung chính (hỗ trợ HTML)
 * @param {string} [options.buttonText] - Text nút CTA (nếu có)
 * @param {string} [options.buttonUrl]  - URL nút CTA (nếu có)
 */
export const emailTemplate = async ({ to, subject, title, body , buttonText , buttonUrl }) => {
  const button = buttonText && buttonUrl
    ? `<a href="${buttonUrl}"
          style="display:inline-block;margin-top:24px;padding:12px 28px;
                 background-color:#4F46E5;color:#ffffff;text-decoration:none;
                 border-radius:6px;font-size:15px;font-weight:600;">
         ${buttonText}
       </a>`
    : ''

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background-color:#ffffff;border-radius:8px;
                      box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#4F46E5;padding:28px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">CRM Mini</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">${title}</h2>
              <div style="color:#374151;font-size:15px;line-height:1.7;">
                ${body}
              </div>
              ${button}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #e5e7eb;
                       background-color:#f9fafb;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:13px;">
                © ${new Date().getFullYear()} CRM Mini. All rights reserved.
              </p>
              <p style="margin:6px 0 0;color:#9ca3af;font-size:12px;">
                This is an automated email, please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return await sendMail(to, subject, html)
}

