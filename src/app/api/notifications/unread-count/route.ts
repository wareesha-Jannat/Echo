import { validateRequest } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NotificationCountInfo } from "@/lib/types";

export async function GET() {
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

    const unreadCount = await prisma.notification.count({
      where: {
        recipientId: loggedInUser.id,
        read: false,
      },
    });

    const data: NotificationCountInfo = {
      unreadCount,
    };
    return Response.json(data);
  } catch (error) {
    return Response.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
