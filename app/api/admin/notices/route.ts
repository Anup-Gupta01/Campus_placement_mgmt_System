import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Notice from "@/lib/models/Notice";
import { v2 as cloudinary } from "cloudinary";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getAdminFromToken(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const token = authHeader.split(" ")[1];
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const decoded = getAdminFromToken(req);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await connectToDatabase();
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const file = formData.get("pdf") as File;

    if (!title || !file) {
      return NextResponse.json({ error: "Title and PDF file are required" }, { status: 400 });
    }

    // Convert file to buffer and upload to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "raw", folder: "campus_notices", format: "pdf" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // ✅ Attach admin's universityCode from JWT
    const universityCode = decoded.universityCode || "LEGACY";

    const notice = new Notice({
      title,
      description,
      pdfUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      postedBy: decoded.id,
      universityCode, // enforce from JWT
    });

    await notice.save();
    return NextResponse.json({ message: "Notice posted successfully", notice }, { status: 201 });
  } catch (error: any) {
    console.error("[Notice POST Error]", error);
    return NextResponse.json({ error: error.message || "Failed to post notice" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const decoded = getAdminFromToken(req);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await connectToDatabase();

    // ✅ Filter notices by admin's universityCode
    const universityCode = decoded.universityCode || "LEGACY";
    const notices = await Notice.find({ universityCode }).sort({ createdAt: -1 });
    return NextResponse.json({ notices });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
