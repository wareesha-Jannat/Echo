import { validateRequest } from "@/auth";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_COUNT = 5;
const MAX_FILE_SIZE_MB = 4;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024; //4MB

interface UploadAttachmentResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (files.length >= MAX_FILE_COUNT) {
      return NextResponse.json(
        { error: `Too many files. Max allowed is ${MAX_FILE_COUNT}` },
        { status: 400 },
      );
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File "${file.name}" is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`,
          },
          { status: 400 },
        );
      }
    }
    const uplodMedia = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise<UploadAttachmentResult>(
          (resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "post-media-attachments",
                resource_type: "auto",
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result as UploadAttachmentResult);
              },
            );
            uploadStream.end(buffer);
          },
        );

        const type = result.resource_type === "image" ? "IMAGE" : "VIDEO";

        const media = await prisma.media.create({
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            type,
          },
        });
        return { mediaId: media.id };
      }),
    );

    return NextResponse.json({ media: uplodMedia });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: (error as Error).message },
      { status: 500 },
    );
  }
}
