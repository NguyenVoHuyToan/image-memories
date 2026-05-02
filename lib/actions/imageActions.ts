'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Image from "@/lib/models/Image";
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
    const file = formData.get("file") as File;
    const title = formData.get("title") as string || "Untitled";

    if (!file) throw new Error("No file uploaded");
    
    // File validation
    if (file.size > MAX_SIZE) throw new Error("File too large (Max 5MB)");
    if (!ALLOWED_TYPES.includes(file.type)) throw new Error("Invalid file type (Use JPG, PNG, WEBP)");

    const buffer = Buffer.from(await file.arrayBuffer());
    await dbConnect();

    const folder = `memories-app/users/${userId}`;
    
    // Request AI Tagging (Optional - won't crash if add-on is missing)
    let aiTags: string[] = [];
    try {
      const uploadResult = await uploadStream(buffer, folder, {
        categorization: 'google_tagging',
        auto_tagging: 0.6
      });

      // Extract tags from AI response if available
      if (uploadResult.info?.categorization?.google_tagging?.data) {
        aiTags = uploadResult.info.categorization.google_tagging.data
          .map((tagObj: any) => tagObj.tag);
      }

      const newImage = await Image.create({
        userId,
        url: uploadResult.secure_url,
        cloudinary_id: uploadResult.public_id,
        title,
        size: file.size,
        tags: aiTags
      });

      revalidatePath("/dashboard");
      return { success: true, data: JSON.parse(JSON.stringify(newImage)) };
    } catch (apiError: any) {
      // If AI Tagging fails (e.g. add-on not enabled), try upload without it
      console.warn("AI Tagging failed, uploading without tags:", apiError.message);
      const uploadResult = await uploadStream(buffer, folder);
      
      const newImage = await Image.create({
        userId,
        url: uploadResult.secure_url,
        cloudinary_id: uploadResult.public_id,
        title,
        size: file.size,
        tags: []
      });

      revalidatePath("/dashboard");
      return { success: true, data: JSON.parse(JSON.stringify(newImage)) };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchImagesAction(page: number = 1, limit: number = 12, query: string = "") {
  try {
    const session = await getSession();
    if (!session || !session.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    const skip = (page - 1) * limit;

    await dbConnect();

    const filter: any = { userId };
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ];
    }

    const images = await Image.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Image.countDocuments(filter);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(images)),
      hasMore: skip + images.length < total
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteImageAction(id: string) {
  try {
    const session = await getSession();
    if (!session || !session.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;

    await dbConnect();
    const image = await Image.findById(id);

    if (!image || image.userId.toString() !== userId) {
      throw new Error("Forbidden or not found");
    }

    if (image.cloudinary_id) {
      await deleteImageFromCloudinary(image.cloudinary_id);
    }

    await Image.findByIdAndDelete(id);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateImageAction(id: string, data: { title?: string, tags?: string[] }) {
  try {
    const session = await getSession();
    if (!session || !session.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;

    await dbConnect();
    const image = await Image.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true }
    );

    if (!image) throw new Error("Image not found");

    revalidatePath("/dashboard");
    return { success: true, data: JSON.parse(JSON.stringify(image)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
