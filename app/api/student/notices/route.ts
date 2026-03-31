import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Notice from "@/lib/models/Notice";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

/**
 * GET /api/student/notices
 * Returns the 10 most recent notices scoped to the student's universityCode from JWT.
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    await connectToDatabase();

    // ✅ Filter notices by student's universityCode from JWT
    const universityCode = decoded.universityCode || "LEGACY";
    const notices = await Notice.find({ universityCode }).sort({ createdAt: -1 }).limit(10);

    return NextResponse.json({ notices });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
