const crypto = require("crypto")
const User = require("../Models/User")
const nodemailer = require("nodemailer")
const Admin = require("../Models/Admin")




const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  secure: false,
  port: 587,
  auth:
  {
    user: process.env.user,
    pass: process.env.pass,
  }
})
transporter.verify((err, succ) => {
  if (!err) {
    console.log('Nodemailer is Ready to send Mails')
  }
})
module.exports.sendotp = async (email, isadm) => {
  try {

    const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0')
    let user
    if (!isadm) {
      user = await User.findOne({ email })
    } else {
      user = await Admin.findOne({ email })
    }
    user.otpd.otp = otp,
      user.otpd.expired = Date.now() + 5 * 60 * 1000,
      await user.save()
    const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your One-Time Password</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f8f9fa;
        color: #212529;
      }
      .container {
        max-width: 500px;
        margin: 0 auto;
        background-color: #ffffff;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 40px;
        text-align: center;
      }
      .header {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 20px;
      }
      .otp-code {
        font-size: 36px;
        font-weight: 700;
        letter-spacing: 4px;
        color: #000000;
        margin: 30px 0;
        padding: 15px;
        background-color: #f1f3f5;
        border-radius: 4px;
      }
      .footer {
        font-size: 14px;
        color: #6c757d;
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">Blikin Ecommerce</div>
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
        Here is your One-Time Password (OTP) for account verification.
      </p>
      <div class="otp-code">${otp}</div>
      <p class="footer">
        This code will expire in 10 minutes. If you did not request this, please ignore this email.
      </p>
    </div>
  </body>
  </html>
  `;

    await transporter.sendMail({
      from: "raghavji014@gmail.com",
      to: email,
      subject: 'one time password',
      html: htmlContent
    })

    return true
  } catch (err) {
    console.log('Eror is here', err)
    return false
  }
}