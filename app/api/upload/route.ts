import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Image from "@/lib/models/Image";
import { uploadStream } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string || "Untitled";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 3. Connect to Database
    try {
      await dbConnect();
    } catch (dbError: any) {
      console.error('Database connection failed in Upload API:', dbError);
      return NextResponse.json(
        { error: "Không thể kết nối đến cơ sở dữ liệu để lưu thông tin ảnh." }, 
        { status: 503 }
      );
    }

    const uploadResult = await uploadStream(buffer, "memories");

    const newImage = await Image.create({
      userId,
      url: uploadResult.secure_url,
      cloudinary_id: uploadResult.public_id,
      title,
      size: file.size,
    });

    return NextResponse.json(newImage, { status: 201 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
