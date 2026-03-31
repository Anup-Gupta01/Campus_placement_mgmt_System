import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Opportunity from "@/lib/models/Opportunity";
import Application from "@/lib/models/Application";

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
    const opp = await Opportunity.findById(params.id).lean() as any;
    if (!opp) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    // ✅ Ensure admin can only view opportunities from their own university
    if (opp.universityCode && opp.universityCode !== (decoded.universityCode || "LEGACY")) {
      return NextResponse.json({ error: "Access denied. This opportunity belongs to another university." }, { status: 403 });
    }

    // Aggregate applicant stats
    const totalApplicants = await Application.countDocuments({ opportunity: params.id });
    const shortlisted    = await Application.countDocuments({ opportunity: params.id, status: "Shortlisted" });
    const inInterview    = await Application.countDocuments({ opportunity: params.id, status: "Interview" });
    const selected       = await Application.countDocuments({ opportunity: params.id, status: "Selected" });
    const rejected       = await Application.countDocuments({ opportunity: params.id, status: "Rejected" });

    return NextResponse.json({
      opportunity: opp,
      stats: { totalApplicants, shortlisted, inInterview, selected, rejected },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = getAdminFromToken(req);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await connectToDatabase();

    // ✅ Verify opportunity belongs to this admin's university before patching
    const opp = await Opportunity.findById(params.id).lean() as any;
    if (!opp) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (opp.universityCode && opp.universityCode !== (decoded.universityCode || "LEGACY")) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const { status } = await req.json();
    const updated = await Opportunity.findByIdAndUpdate(params.id, { status }, { new: true });
    return NextResponse.json({ opportunity: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
