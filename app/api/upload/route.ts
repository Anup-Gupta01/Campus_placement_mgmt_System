import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert Buffer -> Base64 URI so Cloudinary can ingest it easily
    const fileBase64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Perform the Upload explicitly setting resource_type: "auto" for raw PDFs
    const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
      resource_type: "auto",
      folder: "campus_placement"
    });

    return NextResponse.json({ url: uploadResponse.secure_url }, { status: 200 });
  } catch (error: any) {
    console.error("Cloudinary Error:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
