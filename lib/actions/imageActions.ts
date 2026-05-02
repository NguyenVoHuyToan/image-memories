'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Album from "@/lib/models/Album";
import { uploadStream, deleteImageFromCloudinary } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

async function getSession() {
  return await getServerSession(authOptions);
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function uploadImageAction(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    const albumId = formData.get("albumId") as string;
    const file = formData.get("file") as File;
    const title = formData.get("title") as string || "Untitled";

    if (!file) throw new Error("No file uploaded");
    if (!albumId) throw new Error("Album ID is required");
    
    // File validation
    if (file.size > MAX_SIZE) throw new Error("File too large (Max 5MB)");
    if (!ALLOWED_TYPES.includes(file.type)) throw new Error("Invalid file type (Use JPG, PNG, WEBP)");

    const buffer = Buffer.from(await file.arrayBuffer());
    await dbConnect();

    const folder = `memories-app/users/${userId}/albums/${albumId}`;
    
    try {
      const uploadResult = await uploadStream(buffer, folder);

      const imageData = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        title,
        createdAt: new Date()
      };

      const updatedAlbum = await Album.findOneAndUpdate(
        { _id: albumId, userId },
        { $push: { images: imageData } },
        { new: true }
      );

      if (!updatedAlbum) throw new Error("Album not found or access denied");

      revalidatePath("/dashboard");
      return { success: true, data: JSON.parse(JSON.stringify(updatedAlbum)) };
    } catch (apiError: any) {
      console.error("Upload error:", apiError.message);
      throw apiError;
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteImageFromAlbumAction(albumId: string, publicId: string) {
  try {
    const session = await getSession();
    if (!session || !session.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    await dbConnect();

    // Remove from Cloudinary
    await deleteImageFromCloudinary(publicId);

    // Remove from Album document
    const album = await Album.findOneAndUpdate(
      { _id: albumId, userId },
      { $pull: { images: { publicId } } },
      { new: true }
    );

    if (!album) throw new Error("Album not found");

    revalidatePath("/dashboard");
    return { success: true, data: JSON.parse(JSON.stringify(album)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
