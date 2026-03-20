import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Application from "@/lib/models/Application";
import Opportunity from "@/lib/models/Opportunity";

export async function GET() {
  try {
    await connectToDatabase();

    // Get all applications with student and opportunity data
    const applications = await Application.find({})
      .populate("student", "firstName lastName email branch cgpa")
      .populate("opportunity", "companyName role package")
      .sort({ appliedOn: -1 })
      .lean();

    // Build CSV
    const headers = [
      "Student Name", "Email", "Branch", "CGPA",
      "Company", "Role", "Package", "Applied On", "Status"
    ];

    const rows = applications.map((app: any) => {
      const s = app.student || {};
      const o = app.opportunity || {};
      return [
        `${s.firstName || ""} ${s.lastName || ""}`.trim(),
        s.email || "",
        s.branch || "",
        s.cgpa || "",
        o.companyName || "",
        o.role || "",
        o.package || "",
        app.appliedOn ? new Date(app.appliedOn).toLocaleDateString() : "",
        app.status || "",
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="placement_report_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
