import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Application from "@/lib/models/Application";
// @ts-ignore
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v2 as cloudinary } from "cloudinary";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const fileBase64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
      resource_type: "auto",
      folder: "campus_placement/resumes",
    });
    const resumeUrl = uploadResponse.secure_url;

    // Extract text from PDF
    let text = "";
    try {
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } catch {
      text = "Could not extract PDF text.";
    }

    // Gemini Analysis
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are an expert HR recruiter and ATS (Applicant Tracking System) specialist.
Analyze this resume and return STRICTLY VALID JSON ONLY. No markdown, no code blocks, no extra text.
Return exactly this structure:
{
  "overallScore": <number 0-100>,
  "sectionScores": {
    "contactInformation": <number 0-100>,
    "summary": <number 0-100>,
    "experience": <number 0-100>,
    "education": <number 0-100>,
    "skills": <number 0-100>,
    "projects": <number 0-100>,
    "formatting": <number 0-100>
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "missingKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "bestFitRoles": [
    { "role": "Role Name", "match": <number 0-100> },
    { "role": "Role Name", "match": <number 0-100> },
    { "role": "Role Name", "match": <number 0-100> }
  ]
}

Be accurate and helpful. Base scores on resume quality, completeness, and ATS-friendliness.

Resume text (first 15000 chars):
${text.substring(0, 15000)}
`;

    const result = await model.generateContent(prompt);
    let output = result.response.text().trim();

    // Strip markdown code fences if present
    output = output.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    output = output.replace(/^```\s*/i, "").replace(/\s*```$/, "");

    const analysis = JSON.parse(output);

    // Save analysis record to DB
    await connectToDatabase();
    // We'll store a reference on the Application or as a standalone record
    // For now, just return the analysis
    
    return NextResponse.json({
      analysis,
      resumeUrl,
    });
  } catch (error: any) {
    console.error("Resume analysis error:", error);
    return NextResponse.json({ error: error.message || "Analysis failed" }, { status: 500 });
  }
}
