import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
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

// ─────────────────────────────────────────────
//  KEYWORD BANKS  (used in fallback mode)
// ─────────────────────────────────────────────
const KEYWORD_BANKS: Record<string, string[]> = {
  contact: ["email", "phone", "linkedin", "github", "portfolio", "address", "mobile", "website"],
  summary: ["summary", "objective", "profile", "about", "introduction", "career"],
  experience: ["experience", "work", "internship", "employment", "job", "company", "role", "position", "responsibilities", "achieved", "developed", "led", "managed", "designed", "implemented", "built"],
  education: ["education", "university", "college", "bachelor", "master", "b.tech", "m.tech", "bsc", "msc", "degree", "gpa", "cgpa", "percentage", "graduate", "diploma"],
  skills: ["python", "javascript", "typescript", "java", "c++", "c#", "react", "angular", "vue", "node", "express", "django", "flask", "spring", "sql", "mysql", "postgresql", "mongodb", "redis", "docker", "kubernetes", "aws", "azure", "gcp", "git", "github", "ci/cd", "machine learning", "deep learning", "nlp", "tensorflow", "pytorch", "html", "css", "rest", "graphql", "linux", "agile", "scrum"],
  projects: ["project", "built", "developed", "implemented", "created", "deployed", "github", "open source", "application", "system", "platform", "tool", "website", "app"],
  formatting: ["•", "-", "|", "–"],
};

const ROLE_KEYWORD_MAPS: Array<{ role: string; keywords: string[] }> = [
  { role: "Software Developer", keywords: ["javascript", "python", "java", "react", "node", "backend", "frontend", "fullstack", "api", "rest", "git", "agile"] },
  { role: "Data Scientist / ML Engineer", keywords: ["machine learning", "deep learning", "python", "tensorflow", "pytorch", "nlp", "data", "model", "kaggle", "pandas", "numpy", "scikit"] },
  { role: "DevOps / Cloud Engineer", keywords: ["docker", "kubernetes", "ci/cd", "aws", "azure", "gcp", "terraform", "ansible", "jenkins", "linux", "bash", "monitoring"] },
  { role: "Frontend Developer", keywords: ["react", "vue", "angular", "html", "css", "javascript", "typescript", "ui", "ux", "responsive", "figma", "tailwind", "next"] },
  { role: "Backend Developer", keywords: ["node", "express", "django", "flask", "spring", "sql", "postgresql", "mongodb", "api", "microservices", "kafka", "redis"] },
  { role: "Database Administrator", keywords: ["sql", "mysql", "postgresql", "mongodb", "oracle", "nosql", "query", "schema", "indexing", "replication", "backup"] },
  { role: "Cybersecurity Analyst", keywords: ["security", "penetration", "network", "firewall", "encryption", "vulnerability", "linux", "kali", "ethical hacking", "soc"] },
  { role: "Mobile Developer", keywords: ["android", "ios", "flutter", "react native", "kotlin", "swift", "mobile", "app"] },
];

const ALL_IMPORTANT_KEYWORDS = [
  "agile", "scrum", "leadership", "communication", "teamwork", "problem solving",
  "rest api", "microservices", "system design", "object oriented", "data structures",
  "algorithms", "cloud", "testing", "unit test", "code review", "documentation",
  "open source", "published", "certification", "hackathon", "internship",
];

/**
 * Pure keyword-based resume evaluator — runs locally, no API calls.
 */
function keywordFallbackAnalysis(text: string) {
  const lower = text.toLowerCase();
  const has = (keywords: string[]) => keywords.filter(k => lower.includes(k.toLowerCase()));

  // Section scores based on keyword presence
  const contactHits  = has(KEYWORD_BANKS.contact);
  const summaryHits  = has(KEYWORD_BANKS.summary);
  const expHits      = has(KEYWORD_BANKS.experience);
  const eduHits      = has(KEYWORD_BANKS.education);
  const skillHits    = has(KEYWORD_BANKS.skills);
  const projHits     = has(KEYWORD_BANKS.projects);
  const fmtHits      = has(KEYWORD_BANKS.formatting);

  const score = (hits: string[], max: number, total: number) =>
    Math.min(100, Math.round((hits.length / total) * max));

  const sectionScores = {
    contactInformation: score(contactHits,  100, 5),
    summary:            score(summaryHits,  100, 4),
    experience:         score(expHits,      100, 10),
    education:          score(eduHits,      100, 6),
    skills:             score(skillHits,    100, 15),
    projects:           score(projHits,     100, 6),
    formatting:         score(fmtHits,      100, 3),
  };

  const overallScore = Math.round(
    Object.values(sectionScores).reduce((a, b) => a + b, 0) / 7
  );

  // Strengths
  const strengths: string[] = [];
  if (sectionScores.skills >= 60)       strengths.push("Good technical skills coverage");
  if (sectionScores.experience >= 50)   strengths.push("Solid work/internship experience section");
  if (sectionScores.projects >= 50)     strengths.push("Projects section demonstrates practical ability");
  if (sectionScores.education >= 60)    strengths.push("Strong educational background");
  if (sectionScores.contactInformation >= 60) strengths.push("Contact information is complete");
  if (strengths.length === 0) strengths.push("Resume has basic structure");

  // Improvements
  const improvements: string[] = [];
  if (sectionScores.summary < 40)       improvements.push("Add a professional summary/objective section");
  if (sectionScores.skills < 40)        improvements.push("Expand the skills section with more relevant technologies");
  if (sectionScores.experience < 40)    improvements.push("Add more detail on work experience and achievements");
  if (sectionScores.projects < 40)      improvements.push("Include links and descriptions for projects (e.g. GitHub links)");
  if (sectionScores.contactInformation < 60) improvements.push("Ensure email, phone, and LinkedIn are clearly listed");
  if (sectionScores.formatting < 50)    improvements.push("Use bullet points for better ATS readability");
  if (improvements.length === 0)        improvements.push("Quantify achievements with metrics where possible");

  // Missing keywords
  const missingKeywords = ALL_IMPORTANT_KEYWORDS
    .filter(k => !lower.includes(k))
    .slice(0, 6);

  // Best fit roles
  const bestFitRoles = ROLE_KEYWORD_MAPS
    .map(({ role, keywords }) => {
      const matches = keywords.filter(k => lower.includes(k.toLowerCase())).length;
      return { role, match: Math.min(100, Math.round((matches / keywords.length) * 100)) };
    })
    .sort((a, b) => b.match - a.match)
    .slice(0, 3);

  return {
    overallScore,
    sectionScores,
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
    missingKeywords,
    bestFitRoles,
    _fallback: true, // flag so frontend can show a note
  };
}

// ─────────────────────────────────────────────
//  ROUTE HANDLER
// ─────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET);

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

    const apiKey = process.env.GEMINI_API_KEY;

    // ── Try Gemini 2.0 Flash first ──
    if (apiKey) {
      try {
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
        output = output.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
        output = output.replace(/^```\s*/i, "").replace(/\s*```$/, "");

        const analysis = JSON.parse(output);
        return NextResponse.json({ analysis, resumeUrl });

      } catch (geminiError: any) {
        const isRateLimit =
          geminiError?.status === 429 ||
          geminiError?.message?.includes("429") ||
          geminiError?.message?.includes("Too Many Requests") ||
          geminiError?.message?.includes("quota") ||
          geminiError?.message?.includes("RESOURCE_EXHAUSTED");

        if (!isRateLimit) {
          // Real error — bubble up
          throw geminiError;
        }

        // ── Rate limited → fall back to keyword analysis ──
        console.warn("[analyze-resume] Gemini quota exceeded — using keyword fallback.");
        const analysis = keywordFallbackAnalysis(text);
        return NextResponse.json({ analysis, resumeUrl });
      }
    }

    // No API key at all → keyword fallback
    const analysis = keywordFallbackAnalysis(text);
    return NextResponse.json({ analysis, resumeUrl });

  } catch (error: any) {
    console.error("Resume analysis error:", error);
    return NextResponse.json({ error: error.message || "Analysis failed" }, { status: 500 });
  }
}
