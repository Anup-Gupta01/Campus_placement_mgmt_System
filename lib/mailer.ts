import nodemailer from "nodemailer";
import { getOtpEmailTemplate, getResetPasswordTemplate } from "./emailTemplates";

// Create a stable transporter instance
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Base email sending function
 */
export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    const info = await transporter.sendMail({
      from: `"Campus Placement System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};

/**
 * Helper: Send OTP Verification Email
 */
export const sendOtpEmail = async (email: string, otp: string, userName: string = "User") => {
  const htmlContent = getOtpEmailTemplate(otp, userName);
  return await sendEmail({
    to: email,
    subject: "Your Verification Code - Campus Placement System",
    html: htmlContent,
  });
};

/**
 * Helper: Send Forgot Password Email
 */
export const sendForgotPasswordEmail = async (email: string, resetLink: string, userName: string = "User") => {
  const htmlContent = getResetPasswordTemplate(resetLink, userName);
  return await sendEmail({
    to: email,
    subject: "Reset Your Password - Campus Placement System",
    html: htmlContent,
  });
};
