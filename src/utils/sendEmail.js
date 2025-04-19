import nodemailer from "nodemailer"

const createPasswordResetEmail = (resetUrl) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Password Reset Request</h2>
          <p>You are receiving this email because you (or someone else) has requested to reset the password for your account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <p>This link will expire in 10 minutes.</p>
        </div>
        <div class="footer">
          <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
          <p>${resetUrl}</p>
        </div>
      </body>
    </html>
  `
}

export const sendEmail = async (options) => {
  // Create reusable transporter for Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  })

  // Define email options
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.GMAIL_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html || options.message,
  }

  // Send email
  await transporter.sendMail(mailOptions)
}

export const sendPasswordResetEmail = async (email, resetUrl) => {
  await sendEmail({
    email,
    subject: "Password Reset Request",
    html: createPasswordResetEmail(resetUrl)
  })
}
