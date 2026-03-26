import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notice from "@/lib/models/Notice";

export async function GET() {
  try {
    await connectToDatabase();
    // Return the 10 most recent notices for the student notice panel
    const notices = await Notice.find({}).sort({ createdAt: -1 }).limit(10);
    return NextResponse.json({ notices });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
