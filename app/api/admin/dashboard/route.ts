import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import Opportunity from "@/lib/models/Opportunity";
import Application from "@/lib/models/Application";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export async function GET(req: Request) {
  try {
    // ✅ Require admin JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admins only." }, { status: 403 });
    }

    await connectToDatabase();

    // ✅ Scope everything to the admin's universityCode
    const universityCode = decoded.universityCode || "LEGACY";

    // Aggregate stats — scoped to this university
    const totalStudents = await User.countDocuments({ role: "student", universityCode });
    const activeOpportunities = await Opportunity.countDocuments({ status: "Open", universityCode });
    const partnerCompanies = await Opportunity.distinct("companyName", { universityCode });
    const totalSelected = await Application.countDocuments({ status: "Selected", universityCode });
    const placementRate = totalStudents > 0
      ? ((totalSelected / totalStudents) * 100).toFixed(1)
      : "0.0";

    // Branch-wise selected students — scoped to this university
    const branchWise = await Application.aggregate([
      { $match: { status: "Selected", universityCode } },
      {
        $lookup: {
          from: "users",
          localField: "student",
          foreignField: "_id",
          as: "studentData",
        },
      },
      { $unwind: "$studentData" },
      {
        $group: {
          _id: "$studentData.branch",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Monthly placement trend (last 7 months) — scoped
    const now = new Date();
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const trendPromises = Array.from({ length: 7 }).map(async (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const count = await Application.countDocuments({
        status: "Selected",
        universityCode,
        appliedOn: { $gte: d, $lt: end },
      });
      return { month: monthNames[d.getMonth()], count };
    });
    const placementTrend = await Promise.all(trendPromises);

    // Active opportunities with applicant stats — scoped
    const activeOpps = await Opportunity.find({ status: "Open", universityCode })
      .sort({ applicationDeadline: 1 })
      .limit(5)
      .lean();

    const activeOppsWithStats = await Promise.all(
      activeOpps.map(async (opp: any) => {
        const applicants = await Application.countDocuments({ opportunity: opp._id });
        const shortlisted = await Application.countDocuments({ opportunity: opp._id, status: "Shortlisted" });
        const selected = await Application.countDocuments({ opportunity: opp._id, status: "Selected" });
        return { ...opp, applicants, shortlisted, selected };
      })
    );

    // Recent applications — scoped
    const recentApps = await Application.find({ universityCode })
      .sort({ appliedOn: -1 })
      .limit(5)
      .populate("student", "firstName lastName email branch cgpa")
      .populate("opportunity", "companyName role")
      .lean();

    return NextResponse.json({
      stats: {
        totalStudents,
        activeOpportunities,
        placementRate: `${placementRate}%`,
        partnerCompanies: partnerCompanies.length,
        totalSelected,
      },
      placementTrend,
      branchWise: branchWise.map((b: any) => ({ name: b._id || "Unknown", count: b.count })),
      activeOpportunities: activeOppsWithStats,
      recentApplications: recentApps,
    });
  } catch (error: any) {
    console.error("[Dashboard API Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
