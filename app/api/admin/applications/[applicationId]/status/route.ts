import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Application from "@/lib/models/Application";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export async function PATCH(
  req: Request,
  props: { params: Promise<{ applicationId: string }> }
) {
  const params = await props.params;
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

    // ✅ Fetch the application and verify universityCode matches admin's
    const application = await Application.findById(params.applicationId);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const adminUniversityCode = decoded.universityCode || "LEGACY";
    const appUniversityCode = application.universityCode || "LEGACY";
    if (adminUniversityCode !== appUniversityCode) {
      return NextResponse.json(
        { error: "Access denied. This application belongs to another university." },
        { status: 403 }
      );
    }

    const { status } = await req.json();
    const validStatuses = ["Applied", "Shortlisted", "OA Pending", "Interview", "Selected", "Rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await Application.findByIdAndUpdate(
      params.applicationId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    return NextResponse.json({ application: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
