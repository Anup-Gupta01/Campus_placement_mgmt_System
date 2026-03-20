import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Application from "@/lib/models/Application";

export async function PATCH(
  req: Request,
  { params }: { params: { applicationId: string } }
) {
  try {
    await connectToDatabase();
    const { status } = await req.json();

    const validStatuses = ["Applied", "Shortlisted", "OA Pending", "Interview", "Selected", "Rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const app = await Application.findByIdAndUpdate(
      params.applicationId,
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    return NextResponse.json({ application: app });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
