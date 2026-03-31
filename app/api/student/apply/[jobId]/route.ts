import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Application from "@/lib/models/Application";
import Opportunity from "@/lib/models/Opportunity";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

const TIMELINE_STAGES = [
  "Applied",
  "Resume Shortlisted",
  "Online Assessment",
  "Technical Round 1",
  "Technical Round 2",
  "HR Round",
  "Final Result",
];

function getProgress(status: string): number {
  const map: Record<string, number> = {
    Applied: 14,
    Shortlisted: 28,
    "OA Pending": 42,
    Interview: 57,
    Selected: 100,
    Rejected: 25,
  };
  return map[status] ?? 14;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const { jobId } = await params;

    await connectToDatabase();

    // Check if already applied
    const existing = await Application.findOne({
      student: decoded.id,
      opportunity: jobId,
    });
    if (existing) {
      return NextResponse.json({ error: "Already applied to this opportunity" }, { status: 409 });
    }

    // Check opportunity exists
    const opportunity = await Opportunity.findById(jobId) as any;
    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    // ✅ Ensure student can only apply to opportunities from their own university
    const studentUniversityCode = decoded.universityCode || "LEGACY";
    const oppUniversityCode = opportunity.universityCode || "LEGACY";
    if (studentUniversityCode !== oppUniversityCode) {
      return NextResponse.json(
        { error: "You can only apply to opportunities from your own university." },
        { status: 403 }
      );
    }

    // Build default timeline
    const timeline = TIMELINE_STAGES.map((stage, index) => ({
      stage,
      date: index === 0 ? new Date() : null,
      isCurrent: index === 0,
      isCompleted: index === 0,
    }));

    const application = await Application.create({
      student: decoded.id,
      opportunity: jobId,
      status: "Applied",
      progress: getProgress("Applied"),
      timeline,
      universityCode: studentUniversityCode, // ✅ stamp universityCode on the application
    });

    return NextResponse.json({ message: "Application submitted!", application }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
