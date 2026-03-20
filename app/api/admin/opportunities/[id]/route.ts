import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Opportunity from "@/lib/models/Opportunity";
import Application from "@/lib/models/Application";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const opp = await Opportunity.findById(params.id).lean();
    if (!opp) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
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
    await connectToDatabase();
    const { status } = await req.json();
    const opp = await Opportunity.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );
    if (!opp) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ opportunity: opp });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
