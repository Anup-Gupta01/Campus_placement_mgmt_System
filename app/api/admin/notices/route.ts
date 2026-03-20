import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notice from "@/lib/models/Notice";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
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

    const notice = new Notice({
      title,
      description,
      pdfUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });

    await notice.save();
    return NextResponse.json({ message: "Notice posted successfully", notice }, { status: 201 });
  } catch (error: any) {
    console.error("[Notice POST Error]", error);
    return NextResponse.json({ error: error.message || "Failed to post notice" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const notices = await Notice.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ notices });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
