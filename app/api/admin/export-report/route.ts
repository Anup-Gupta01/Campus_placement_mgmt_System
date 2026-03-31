import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Application from "@/lib/models/Application";
import Opportunity from "@/lib/models/Opportunity";

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

    // ✅ Only export data from admin's own university
    const universityCode = decoded.universityCode || "LEGACY";

    const applications = await Application.find({ universityCode })
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
        "Content-Disposition": `attachment; filename="placement_report_${universityCode}_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
