import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import nodemailer from "nodemailer";
import twilio from "twilio";

const allowedAdmins = [
  "tnp@abcuniversity.edu",
  "placement@xyzcollege.edu"
];

// Helper to send professional HTML email
async function sendEmailOTP(email: string, otp: number, name: string) {
  const htmlTemplate = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #4f46e5; font-size: 28px; margin: 0;">PlacementPro</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Campus Placement Management System</p>
      </div>
      <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">Hello <b>${name}</b>,</p>
      <p style="color: #334155; font-size: 16px; line-height: 1.5;">Thank you for registering with PlacementPro. To securely complete your verification, please use the following One-Time Password (OTP):</p>
      
      <div style="background-color: #f8fafc; border: 2px dashed #94a3b8; padding: 24px; text-align: center; margin: 30px 0; border-radius: 12px;">
        <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #0f172a;">${otp}</span>
      </div>
      
      <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">⚠️ This code is valid for exactly <b>10 minutes</b>. Do not share this code with anyone.</p>
      <p style="color: #64748b; font-size: 14px;">If you did not initiate this request, you can safely ignore this email.</p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      <p style="color: #94a3b8; font-size: 13px; text-align: center;">Best regards,<br/>The PlacementPro Technical Team</p>
    </div>
  `;

  if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_USER !== "your_email@gmail.com") {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      await transporter.sendMail({
        from: `"PlacementPro Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your PlacementPro Verification Code",
        html: htmlTemplate
      });
      console.log(`[LOG] Successfully sent Email OTP to ${email}`);
    } catch(err) {
      console.error("[ERROR] Failed to send Email OTP:", err);
    }
  } else {
    // Dev Fallback
    console.log(`\n=========================================\n[DEV MODE] NO VALID SMTP CREDS. OTP for EMAIL ${email} is: ${otp}\n=========================================\n`);
  }
}

// Helper to send SMS via Twilio
async function sendMobileOTP(mobileNo: string, otp: number) {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_ACCOUNT_SID !== "your_account_sid") {
    try {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      // Ensure mobileNo has a country code, e.g. assumes +91 if none provided for India
      const formattedMobile = mobileNo.startsWith("+") ? mobileNo : `+91${mobileNo}`;
      
      await client.messages.create({
        body: `Your PlacementPro verification code is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedMobile
      });
      console.log(`[LOG] Successfully sent SMS OTP to ${formattedMobile}`);
    } catch(err) {
      console.error("[ERROR] Failed to send SMS OTP:", err);
    }
  } else {
     // Dev Fallback
     console.log(`\n=========================================\n[DEV MODE] NO VALID TWILIO CREDS. OTP for MOBILE ${mobileNo} is: ${otp}\n=========================================\n`);
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { firstName, lastName, email, password, mobileNo, university, course, branch, year, dob, gender, verifyVia, designation, jobId } = body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    // Default role
    let role = "student";
    if (allowedAdmins.includes(email)) {
      role = "admin";
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000); // 6 digit OTP
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

    const user = new User({
      firstName, lastName, email, mobileNo,
      password: hashedPassword,
      role,
      university, course, branch, year, dob, gender, designation, jobId,
      otp: otp.toString(),
      otpExpiry,
      isVerified: false
    });

    await user.save();

    // Send OTP Based on user's preference
    if (verifyVia === "mobile") {
      await sendMobileOTP(mobileNo, otp);
    } else {
      await sendEmailOTP(email, otp, firstName);
    }

    return NextResponse.json(
      { message: `Account created successfully. OTP sent to ${verifyVia === "mobile" ? "mobile" : "email"}.`, email },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
