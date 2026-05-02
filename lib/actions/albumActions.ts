'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Album from "@/lib/models/Album";
import { revalidatePath } from "next/cache";

async function getSession() {
  return await getServerSession(authOptions);
}

export async function createAlbumAction(name: string = "New Album") {
  try {
    const session = await getSession();
    if (!session || !session.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    await dbConnect();

    const newAlbum = await Album.create({
      userId,
      name,
      images: []
    });

    revalidatePath("/dashboard");
    return { success: true, data: JSON.parse(JSON.stringify(newAlbum)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchAlbumsAction() {
  try {
    const session = await getSession();
    if (!session || !session.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    await dbConnect();

    const albums = await Album.find({ userId }).sort({ updatedAt: -1 });

    return { success: true, data: JSON.parse(JSON.stringify(albums)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAlbumNameAction(albumId: string, name: string) {
  try {
    const session = await getSession();
    if (!session || !session.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    await dbConnect();

    const album = await Album.findOneAndUpdate(
      { _id: albumId, userId },
      { $set: { name } },
      { new: true }
    );

    if (!album) throw new Error("Album not found");

    revalidatePath("/dashboard");
    return { success: true, data: JSON.parse(JSON.stringify(album)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAlbumAction(albumId: string) {
  try {
    const session = await getSession();
    if (!session || !session.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    await dbConnect();

    const album = await Album.findOneAndDelete({ _id: albumId, userId });
    if (!album) throw new Error("Album not found");

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
