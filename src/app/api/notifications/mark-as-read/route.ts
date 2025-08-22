import { validateRequest } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH() {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json(
        {
          error: "unauthorized",
        },
        { status: 401 },
      );
    }

    await prisma.notification.updateMany({
      where: {
        recipientId: loggedInUser.id,
        read: false,
      },
      data: {
        read: true,
      },
    });
    return new Response();
  } catch (error) {
    return Response.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
