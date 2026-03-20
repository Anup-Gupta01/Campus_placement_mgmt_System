import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import Opportunity from "@/lib/models/Opportunity";
import Application from "@/lib/models/Application";

export async function GET() {
  try {
    await connectToDatabase();

    // Aggregate stats
    const totalStudents = await User.countDocuments({ role: "student" });
    const activeOpportunities = await Opportunity.countDocuments({ status: "Open" });
    const partnerCompanies = await Opportunity.distinct("companyName");
    const totalSelected = await Application.countDocuments({ status: "Selected" });
    const placementRate = totalStudents > 0
      ? ((totalSelected / totalStudents) * 100).toFixed(1)
      : "0.0";

    // Branch-wise selected students
    const branchWise = await Application.aggregate([
      { $match: { status: "Selected" } },
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

    // Monthly placement trend (last 7 months)
    const now = new Date();
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const trendPromises = Array.from({ length: 7 }).map(async (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const count = await Application.countDocuments({
        status: "Selected",
        appliedOn: { $gte: d, $lt: end },
      });
      return { month: monthNames[d.getMonth()], count };
    });
    const placementTrend = await Promise.all(trendPromises);

    // Active opportunities with applicant stats
    const activeOpps = await Opportunity.find({ status: "Open" })
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

    // Recent applications
    const recentApps = await Application.find({})
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
