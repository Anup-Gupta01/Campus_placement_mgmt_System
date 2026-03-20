import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Application from "@/lib/models/Application";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    const query: any = { opportunity: params.id };
    if (statusFilter && statusFilter !== "All") {
      query.status = statusFilter;
    }

    const applicants = await Application.find(query)
      .sort({ appliedOn: -1 })
      .populate("student", "firstName lastName email mobileNo branch cgpa skills resumeUrl resumes")
      .lean();

    return NextResponse.json({ applicants });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
