import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Application from "@/lib/models/Application";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";

    await connectToDatabase();

    let query: any = { student: decoded.id };

    if (filter === "active") {
      query.status = { $in: ["Applied", "Shortlisted", "OA Pending", "Interview"] };
    } else if (filter === "selected") {
      query.status = "Selected";
    } else if (filter === "rejected") {
      query.status = "Rejected";
    }

    const applications = await Application.find(query)
      .populate("opportunity")
      .sort({ appliedOn: -1 });

    const formatted = applications.map(app => {
      const opp = app.opportunity as any;
      return {
        _id: app._id,
        status: app.status,
        progress: app.progress,
        appliedOn: app.appliedOn,
        timeline: app.timeline,
        resumeUrl: app.resumeUrl,
        offerLetterUrl: app.offerLetterUrl,
        opportunity: {
          _id: opp?._id,
          companyName: opp?.companyName || "Company",
          role: opp?.role || "Role",
          location: opp?.location || "N/A",
          package: opp?.package || "N/A",
          type: opp?.type || "Full-time",
        },
      };
    });

    return NextResponse.json({ applications: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
