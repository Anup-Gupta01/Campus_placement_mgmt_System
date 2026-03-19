import { NextResponse } from 'next/server';
// @ts-ignore
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the PDF using stable v1.1.1
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    // Use Gemini for intelligent parsing
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY in .env.local" }, { status: 500 });
    }

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
    
    if (output.startsWith('```json')) {
      output = output.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (output.startsWith('```')) {
      output = output.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    const parsedData = JSON.parse(output);

    return NextResponse.json(parsedData, { status: 200 });
  } catch(err: any) {
    console.error("AI Parsing Error: ", err);
    return NextResponse.json({ error: err.message || "AI Parsing failed" }, { status: 500 });
  }
}
