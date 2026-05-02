'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { revalidatePath } from "next/cache";
import { uploadStream } from "@/lib/cloudinary";

async function getSession() {
  return await getServerSession(authOptions);
}

export async function uploadAvatarAction(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file uploaded");

    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = `memories-app/users/${userId}/profile`;
    
    console.log("Uploading avatar to Cloudinary...");
    const result = await uploadStream(buffer, folder);
    
    if (!result || !result.secure_url) {
      throw new Error("Failed to get URL from Cloudinary");
    }

    await dbConnect();
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { avatar: result.secure_url },
      { new: true }
    );

    console.log("Avatar updated in DB for user:", userId);
    
    revalidatePath("/dashboard");
    
    return { 
      success: true, 
      url: result.secure_url,
      avatar: result.secure_url // Backup field
    };
  } catch (error: any) {
    console.error("Avatar Upload Error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function updateUserProfileAction(data: { username?: string, bio?: string, avatar?: string }) {
  try {
    const session = await getSession();
    if (!session || !session.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    await dbConnect();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true }
    );

    revalidatePath("/dashboard");
    return { success: true, data: JSON.parse(JSON.stringify(updatedUser)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateDashboardBackgroundAction(background: string) {
  try {
    const session = await getSession();
    if (!session || !session.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    await dbConnect();

    await User.findByIdAndUpdate(userId, { dashboardBackground: background });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserProfileAction() {
  try {
    const session = await getSession();
    if (!session || !session.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    await dbConnect();

    const user = await User.findById(userId).select("-password");
    return { success: true, data: JSON.parse(JSON.stringify(user)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
