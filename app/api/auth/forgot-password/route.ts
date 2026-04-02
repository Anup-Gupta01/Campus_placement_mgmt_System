import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await dbConnect();

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "No account found with that email address." }, { status: 404 });
    }

    // Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Update user document
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send the OTP email
    const emailRes = await sendOtpEmail(email, otp, user.firstName || "User");

    if (!emailRes.success) {
      console.error("Email sending failed:", emailRes.error);
      return NextResponse.json({ error: "Failed to send OTP email. Please try again later." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully." });

  } catch (error: any) {
    console.error("Forgot Password API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
