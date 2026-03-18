import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email/Username and password are required" }, { status: 400 });
    }

    // Note: Hybrid querying for email OR username
    const isEmail = email.includes("@");
    const query = isEmail ? { email } : { username: email };

    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ error: "Verify OTP first", isVerified: false }, { status: 403 });
    }

    // generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      { message: "Login successful", token, role: user.role },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
