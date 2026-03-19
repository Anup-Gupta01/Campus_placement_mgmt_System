import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Opportunity from "@/lib/models/Opportunity";

export async function GET() {
  try {
    await connectToDatabase();
    const opportunities = await Opportunity.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ opportunities }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
