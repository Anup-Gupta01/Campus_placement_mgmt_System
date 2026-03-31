import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Application from "@/lib/models/Application";
import Opportunity from "@/lib/models/Opportunity";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

function getAdminFromToken(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const token = authHeader.split(" ")[1];
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = getAdminFromToken(req);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await connectToDatabase();

    // ✅ Verify the opportunity belongs to the admin's university
    const opp = await Opportunity.findById(params.id).lean() as any;
    if (!opp) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    if (opp.universityCode && opp.universityCode !== (decoded.universityCode || "LEGACY")) {
      return NextResponse.json({ error: "Access denied. This opportunity belongs to another university." }, { status: 403 });
    }

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
