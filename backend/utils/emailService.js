const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

const sendOTP = async (email, otp, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Engimate - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
        <div style="background-color: #2C3E50; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Engimate</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #2C3E50; margin-top: 0;">Hello ${name}!</h2>
          <p style="color: #4A6278; font-size: 16px; line-height: 1.6;">
            Thank you for registering with Engimate. To complete your registration, please use the following OTP:
          </p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #2C3E50; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="color: #4A6278; font-size: 14px; line-height: 1.6;">
            This OTP is valid for 5 minutes. Please do not share this code with anyone.
          </p>
          <p style="color: #7B8FA3; font-size: 13px; margin-top: 30px;">
            If you didn't request this verification, please ignore this email.
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #7B8FA3; font-size: 12px;">
          <p>&copy; 2025 Engimate. All rights reserved.</p>
        </div>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    return true
  }
}

module.exports = { sendOTP }
