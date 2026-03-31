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

export async function POST(req: Request) {
  try {
    const decoded = getAdminFromToken(req);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await connectToDatabase();
    const data = await req.json();

    if (!data.companyName || !data.role || !data.minCGPA || !data.applicationDeadline) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ Always use admin's universityCode from JWT — never trust body
    const universityCode = decoded.universityCode || "LEGACY";

    const newJob = new Opportunity({
      ...data,
      status: "Open",
      universityCode,      // enforce from JWT
      createdBy: decoded.id,
    });
    await newJob.save();

    return NextResponse.json({ message: "Opportunity posted successfully", job: newJob }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to post opportunity" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const decoded = getAdminFromToken(req);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    // ✅ Scope all queries to admin's universityCode
    const universityCode = decoded.universityCode || "LEGACY";
    const query: any = { universityCode };
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

    const totalOpps   = await Opportunity.countDocuments({ universityCode });
    const activeCount = await Opportunity.countDocuments({ universityCode, status: "Open" });
    const closedCount = await Opportunity.countDocuments({ universityCode, status: "Closed" });
    const totalApps   = await Application.countDocuments({ universityCode });

    return NextResponse.json({
      opportunities: oppsWithCounts,
      summary: { total: totalOpps, active: activeCount, closed: closedCount, totalApplicants: totalApps },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }
}
