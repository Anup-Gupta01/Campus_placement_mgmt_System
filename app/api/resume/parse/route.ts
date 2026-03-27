import { NextResponse } from 'next/server';
// @ts-ignore
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─────────────────────────────────────────────
//  LOCAL KEYWORD-BASED FALLBACK PARSER
//  Runs entirely on-device — no API calls needed.
// ─────────────────────────────────────────────

const SKILL_KEYWORDS = [
  "python", "javascript", "typescript", "java", "c++", "c#", "c", "go", "rust", "kotlin", "swift",
  "react", "angular", "vue", "next.js", "node.js", "express", "django", "flask", "spring", "fastapi",
  "sql", "mysql", "postgresql", "mongodb", "redis", "firebase", "supabase",
  "docker", "kubernetes", "aws", "azure", "gcp", "git", "github", "gitlab", "ci/cd",
  "machine learning", "deep learning", "nlp", "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn",
  "html", "css", "tailwind", "bootstrap", "graphql", "rest", "linux", "bash", "agile", "scrum",
  "figma", "canva", "photoshop", "flutter", "react native", "android", "ios",
];

const BRANCH_MAP: Record<string, string> = {
  "computer science": "Computer Science",
  "cse": "Computer Science",
  "information technology": "Information Technology",
  "it": "Information Technology",
  "electronics": "Electronics & Communication",
  "ece": "Electronics & Communication",
  "electrical": "Electrical Engineering",
  "eee": "Electrical Engineering",
  "mechanical": "Mechanical Engineering",
  "mech": "Mechanical Engineering",
  "civil": "Civil Engineering",
  "chemical": "Chemical Engineering",
  "biotechnology": "Biotechnology",
  "data science": "Data Science",
  "ai": "Artificial Intelligence",
  "artificial intelligence": "Artificial Intelligence",
};

function extractEmail(text: string): string {
  const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : "";
}

function extractPhone(text: string): string {
  const match = text.match(/(\+?\d[\d\s\-().]{8,14}\d)/);
  return match ? match[1].replace(/\s+/g, " ").trim() : "";
}

function extractName(text: string): { firstName: string; lastName: string } {
  // The first non-empty line is usually the name
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const nameLine = lines[0] || "";
  // Avoid lines that look like headers or emails
  if (nameLine.includes("@") || nameLine.length > 50 || /^\d/.test(nameLine)) {
    return { firstName: "", lastName: "" };
  }
  const parts = nameLine.split(/\s+/);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
}

function extractCGPA(text: string): string {
  const patterns = [
    /cgpa[:\s]+([0-9.]+)/i,
    /gpa[:\s]+([0-9.]+)/i,
    /([0-9]\.[0-9]{1,2})\s*\/\s*10/i,
    /([0-9]\.[0-9]{1,2})\s*cgpa/i,
    /percentage[:\s]+([0-9.]+)\s*%/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1];
  }
  return "";
}

function extractBranch(text: string): string {
  const lower = text.toLowerCase();
  for (const [keyword, label] of Object.entries(BRANCH_MAP)) {
    if (lower.includes(keyword)) return label;
  }
  return "";
}

function extractLocation(text: string): string {
  // Look for city-like patterns (e.g., "Mumbai, India")
  const match = text.match(/([A-Z][a-z]+(?:,\s*[A-Z][a-z]+)*(?:,\s*India)?)/);
  return match ? match[0] : "";
}

function extractSkills(text: string): string {
  const lower = text.toLowerCase();
  const found = SKILL_KEYWORDS.filter(k => lower.includes(k));
  // Return top 10
  return found.slice(0, 10).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(", ");
}

function extractProjects(text: string): Array<{ title: string; description: string; tags: string[]; link: string }> {
  const projects: Array<{ title: string; description: string; tags: string[]; link: string }> = [];

  // Try to find a Projects section
  const projectSectionMatch = text.match(/projects?\s*[:\n]([\s\S]{0,2000}?)(?:\n[A-Z][A-Z\s]{2,}|\n\n\n|$)/i);
  if (!projectSectionMatch) return projects;

  const section = projectSectionMatch[1];
  const lines = section.split("\n").map(l => l.trim()).filter(Boolean);

  let current: { title: string; description: string; tags: string[]; link: string } | null = null;
  for (const line of lines) {
    // A line in ALL CAPS or Title Case starting after bullet is likely a project title
    const isTitle = /^[A-Z][^\n]{3,60}$/.test(line) && !line.toLowerCase().includes("responsibilities");
    const isLink = line.match(/https?:\/\/[^\s]+/);

    if (isTitle && !line.includes("|") && !line.includes("•")) {
      if (current) projects.push(current);
      current = { title: line, description: "", tags: [], link: "" };
    } else if (current) {
      if (isLink) {
        current.link = isLink[0];
      } else if (current.description.length < 200) {
        current.description += (current.description ? " " : "") + line;
      }
      // Extract tech tags from line
      const lower = line.toLowerCase();
      SKILL_KEYWORDS.forEach(k => {
        if (lower.includes(k) && !current!.tags.includes(k)) {
          current!.tags.push(k.charAt(0).toUpperCase() + k.slice(1));
        }
      });
      current.tags = current.tags.slice(0, 5);
    }
  }
  if (current) projects.push(current);

  return projects.slice(0, 4);
}

function extractAchievements(text: string): string {
  const patterns = [
    /achievements?\s*[:\n]([\s\S]{0,800}?)(?:\n[A-Z][A-Z\s]{2,}|\n\n\n|$)/i,
    /honors?\s*(?:&\s*awards?)?\s*[:\n]([\s\S]{0,800}?)(?:\n[A-Z][A-Z\s]{2,}|\n\n\n|$)/i,
    /extra.?curricular\s*[:\n]([\s\S]{0,800}?)(?:\n[A-Z][A-Z\s]{2,}|\n\n\n|$)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      return m[1]
        .split("\n")
        .map(l => l.replace(/^[•\-–*]\s*/, "").trim())
        .filter(l => l.length > 5)
        .slice(0, 5)
        .join("\n");
    }
  }
  return "";
}

/**
 * Local keyword-based resume parser — no API calls required.
 */
function keywordFallbackParse(text: string) {
  const { firstName, lastName } = extractName(text);
  return {
    firstName,
    lastName,
    email: extractEmail(text),
    phone: extractPhone(text),
    location: extractLocation(text),
    cgpa: extractCGPA(text),
    branch: extractBranch(text),
    skillsStr: extractSkills(text),
    achievementsStr: extractAchievements(text),
    projects: extractProjects(text),
    _fallback: true,
  };
}

// ─────────────────────────────────────────────
//  ROUTE HANDLER
// ─────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the PDF
    let text = "";
    try {
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } catch {
      text = "";
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "Could not extract text from the PDF." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // ── Try Gemini first ──
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
    Extract the following details from this resume text and return STRICTLY VALID JSON ONLY. No markdown, no comments.
    Format your response EXACTLY like this structure:
    {
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "location": "string",
      "cgpa": "string",
      "branch": "string",
      "skillsStr": "comma separated list of top 10 skills",
      "achievementsStr": "achievement 1\\n achievement 2",
      "projects": [
        {
          "title": "Project Name",
          "description": "Short 1-sentence description",
          "tags": ["tag1", "tag2"],
          "link": "url or empty"
        }
      ]
    }

    If a field is not found in the resume, leave it as an empty string ("") or empty array ([]).
    
    Resume Text:
    ${text.substring(0, 15000)}
    `;

        const result = await model.generateContent(prompt);
        let output = result.response.text().trim();

        output = output.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
        output = output.replace(/^```\s*/i, "").replace(/\s*```$/, "");

        const parsedData = JSON.parse(output);
        return NextResponse.json(parsedData, { status: 200 });

      } catch (geminiError: any) {
        const isRateLimit =
          geminiError?.status === 429 ||
          geminiError?.message?.includes("429") ||
          geminiError?.message?.includes("Too Many Requests") ||
          geminiError?.message?.includes("quota") ||
          geminiError?.message?.includes("RESOURCE_EXHAUSTED");

        if (!isRateLimit) {
          // Real error — bubble it up
          throw geminiError;
        }

        // ── Rate limited → fall back to keyword parser ──
        console.warn("[resume/parse] Gemini quota exceeded — using keyword fallback.");
        const parsedData = keywordFallbackParse(text);
        return NextResponse.json(parsedData, { status: 200 });
      }
    }

    // No API key → keyword fallback
    console.warn("[resume/parse] No GEMINI_API_KEY — using keyword fallback.");
    const parsedData = keywordFallbackParse(text);
    return NextResponse.json(parsedData, { status: 200 });

  } catch (err: any) {
    console.error("Resume parse error:", err);
    return NextResponse.json({ error: err.message || "Parsing failed" }, { status: 500 });
  }
}
