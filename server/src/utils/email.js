import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
})

transporter.verify((error) => {
    if (error) console.error('Gmail connection error:', error.message)
    else console.log('Gmail ready to send emails')
})

const getEmailTemplate = (otp, name, type) => {
    const isReset = type === 'reset'
    const title = isReset ? 'Reset your password' : 'Verify your email'
    const subtitle = isReset
        ? 'Enter this code to reset your BlogSpace password.'
        : `Hi ${name}, enter this code to complete your registration.`

    return `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0"
              style="background:#14141f;border-radius:16px;border:1px solid #2a2a45;overflow:hidden;">
              <tr>
                <td style="padding:28px;text-align:center;background:#0f0f1a;border-bottom:1px solid #2a2a45;">
                  <div style="width:44px;height:44px;background:#7c6af7;border-radius:12px;
                              display:inline-block;line-height:44px;text-align:center;
                              font-size:22px;margin-bottom:10px;">✍</div>
                  <h1 style="margin:0;color:#f1f5f9;font-size:20px;font-weight:600;">BlogSpace</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:36px 32px;text-align:center;">
                  <h2 style="margin:0 0 8px;color:#f1f5f9;font-size:18px;font-weight:500;">${title}</h2>
                  <p style="margin:0 0 28px;color:#94a3b8;font-size:14px;line-height:1.6;">
                    ${subtitle}<br>
                    It expires in <strong style="color:#e2e8f0;">10 minutes</strong>.
                  </p>
                  <div style="background:#1a1a2e;border:2px solid #7c6af7;border-radius:14px;
                              padding:24px;display:inline-block;margin-bottom:28px;">
                    <span style="font-size:36px;font-weight:700;color:#a89af8;
                                 letter-spacing:12px;font-family:'Courier New',monospace;">
                      ${otp}
                    </span>
                  </div>
                  <p style="margin:0;color:#475569;font-size:12px;line-height:1.6;">
                    If you didn't request this, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 32px;text-align:center;border-top:1px solid #2a2a45;">
                  <p style="margin:0;color:#334155;font-size:12px;">© 2026 BlogSpace. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>
  `
}

export const sendOTPEmail = async (email, otp, name = 'there', type = 'register') => {
    const isReset = type === 'reset'
    const subject = isReset
        ? `${otp} — BlogSpace password reset code`
        : `${otp} — BlogSpace email verification code`

    await transporter.sendMail({
        from: `"BlogSpace" <${process.env.GMAIL_USER}>`,
        to: email,
        subject,
        html: getEmailTemplate(otp, name, type),
    })

    console.log(`OTP email sent to ${email}`)
}