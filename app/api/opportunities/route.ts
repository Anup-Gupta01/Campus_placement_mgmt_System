import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Opportunity from "@/lib/models/Opportunity";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

/**
 * GET /api/opportunities
 * Student-facing: returns opportunities scoped to the student's universityCode from JWT.
 * Falls back to returning all if no auth token (for public homepage preview).
 */
export async function GET(req: Request) {
  try {
    await connectToDatabase();

    // Try to extract universityCode from JWT for filtering
    const authHeader = req.headers.get("authorization");
    let universityCode: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        universityCode = decoded.universityCode || null;
      } catch {
        // Invalid token — proceed without filtering (unauthenticated view)
      }
    }

    const query: any = {};
    if (universityCode && universityCode !== "LEGACY") {
      query.universityCode = universityCode;
    }

    const opportunities = await Opportunity.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ opportunities }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
