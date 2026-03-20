import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Opportunity from "@/lib/models/Opportunity";
import Application from "@/lib/models/Application";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();

    if (!data.companyName || !data.role || !data.minCGPA || !data.applicationDeadline) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newJob = new Opportunity({ ...data, status: "Open" });
    await newJob.save();

    return NextResponse.json({ message: "Opportunity posted successfully", job: newJob }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to post opportunity" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    const query: any = {};
    if (statusFilter && statusFilter !== "All") {
      query.status = statusFilter;
    }

    const opportunities = await Opportunity.find(query).sort({ createdAt: -1 }).lean();

    // Attach applicant counts
    const oppsWithCounts = await Promise.all(
      opportunities.map(async (opp: any) => {
        const applicants  = await Application.countDocuments({ opportunity: opp._id });
        const shortlisted = await Application.countDocuments({ opportunity: opp._id, status: "Shortlisted" });
        const selected    = await Application.countDocuments({ opportunity: opp._id, status: "Selected" });
        return { ...opp, applicants, shortlisted, selected };
      })
    );

    const totalOpps   = await Opportunity.countDocuments();
    const activeCount = await Opportunity.countDocuments({ status: "Open" });
    const closedCount = await Opportunity.countDocuments({ status: "Closed" });
    const totalApps   = await Application.countDocuments();

    return NextResponse.json({
      opportunities: oppsWithCounts,
      summary: { total: totalOpps, active: activeCount, closed: closedCount, totalApplicants: totalApps },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }
}
