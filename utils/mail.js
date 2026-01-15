import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()
// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});
// send otp mail during forget password
export const sendOtpMail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: "Reset your password",
    html: `<p>Your OTP to reset password is <b>${otp}</b>.This OTP is valid  for 10 mintes.</p>`
  })

}