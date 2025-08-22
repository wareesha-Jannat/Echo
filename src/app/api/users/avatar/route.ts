// src/app/api/avatar/route.ts
import { validateRequest } from "@/auth";
import { prisma } from "@/lib/prisma";

import cloudinary from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

interface CloudinaryResult {
  secure_url: string;
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result: CloudinaryResult = await cloudinary.uploader.upload(
      `data:${file.type};base64,${buffer.toString("base64")}`,
      {
        folder: "avatars",
        public_id: user.id,
        overwrite: true,
      },
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: result.secure_url },
    });

    return NextResponse.json({ avatar_Url: result.secure_url });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: (error as Error).message },
      { status: 500 },
    );
  }
}
