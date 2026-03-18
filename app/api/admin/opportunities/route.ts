import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Opportunity from "@/lib/models/Opportunity";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();
    
    // Quick validation
    if (!data.companyName || !data.role || !data.minCGPA || !data.applicationDeadline) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newJob = new Opportunity(data);
    await newJob.save();
    
    return NextResponse.json({ message: "Opportunity posted successfully", job: newJob }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to post opportunity" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    // Sort by newest first
    const opportunities = await Opportunity.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ opportunities }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }
}
