import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Image from "@/lib/models/Image";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    await dbConnect();

    const images = await Image.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Image.countDocuments({ userId });

    return NextResponse.json(
      {
        images,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          hasMore: skip + images.length < total,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Fetch images error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
