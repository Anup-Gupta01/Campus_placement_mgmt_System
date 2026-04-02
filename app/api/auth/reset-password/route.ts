import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Email, OTP, and New Password are required." }, { status: 400 });
    }

    await dbConnect();

    // Verify user exists
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "No account found with that email address." }, { status: 404 });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP code." }, { status: 400 });
    }

    // Verify Expiry
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json({ error: "The OTP code has expired. Please request a new one." }, { status: 400 });
    }

    // Hash the new password safely
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password, and clear the OTP fields to prevent reuse
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    return NextResponse.json({ success: true, message: "Password updated successfully." });

  } catch (error: any) {
    console.error("Reset Password API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
