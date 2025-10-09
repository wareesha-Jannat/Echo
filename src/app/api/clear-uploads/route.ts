import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json(
        {
          message: "Invalid Authorization header",
        },
        { status: 401 },
      );
    }

    const unusedMedia = await prisma.media.findMany({
      where: {
        postId: null,
      },
      select: {
        url: true,
        id: true,
        publicId: true,
      },
    });

    await cloudinary.api.delete_resources(unusedMedia.map((m) => m.publicId));
    console.log("unused media clenup successfull", unusedMedia.length);

    await prisma.media.deleteMany({
      where: {
        id: {
          in: unusedMedia.map((m) => m.id),
        },
      },
    });
    return new Response();
  } catch (error) {
    console.log("error", error);
    return Response.json(
      { error: "Internal Server Error", message: (error as Error).message },
      { status: 500 },
    );
  }
}
