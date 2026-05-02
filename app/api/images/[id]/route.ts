import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Image from "@/lib/models/Image";
import { deleteImageFromCloudinary } from "@/lib/cloudinary";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;

    await dbConnect();

    const image = await Image.findById(id);

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Check ownership
    if (image.userId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete from Cloudinary
    if (image.cloudinary_id) {
      await deleteImageFromCloudinary(image.cloudinary_id);
    }

    // Delete from MongoDB
    await Image.findByIdAndDelete(id);

    return NextResponse.json({ message: "Image deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Delete image error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
