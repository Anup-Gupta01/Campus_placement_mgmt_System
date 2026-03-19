import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Application from "@/lib/models/Application";
import Opportunity from "@/lib/models/Opportunity";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    await connectToDatabase();

    // Fetch all applications for this student
    const applications = await Application.find({ student: decoded.id })
      .populate("opportunity")
      .sort({ appliedOn: -1 });

    // Compute stats
    const totalApps = applications.length;
    const interviews = applications.filter(a =>
      ["Interview", "Selected"].includes(a.status)
    ).length;
    const offers = applications.filter(a => a.status === "Selected").length;

    // Recent 3
    const recentApps = applications.slice(0, 3).map(a => ({
      _id: a._id,
      status: a.status,
      progress: a.progress,
      appliedOn: a.appliedOn,
      company: (a.opportunity as any)?.companyName || "Company",
      role: (a.opportunity as any)?.role || "Role",
      opportunityId: (a.opportunity as any)?._id,
    }));

    return NextResponse.json({
      stats: {
        applications: totalApps,
        interviews,
        offers,
        profileScore: 75, // placeholder — could be computed
      },
      recentApplications: recentApps,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
