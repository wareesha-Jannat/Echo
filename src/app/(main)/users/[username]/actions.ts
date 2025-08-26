"use server";

import { deleteSession, deleteSessionCookie, validateRequest } from "@/auth";
import { prisma } from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { getUserDataSelect } from "@/lib/types";
import { editProfileSchema, UpdateProfileValues } from "@/lib/validation";

export async function EditProfile(values: UpdateProfileValues) {
  const validatedValues = editProfileSchema.parse(values);

  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const updatedProfile = await prisma.$transaction(async (tx) => {
    const updatedProfile = await tx.user.update({
      where: {
        id: user.id,
      },
      data: validatedValues,
      select: getUserDataSelect(user.id),
    });
    await streamServerClient.partialUpdateUser({
      id: user.id,
      set: {
        name: validatedValues.displayName,
      },
    });
    return updatedProfile;
  });

  return updatedProfile;
}

export async function DeleteAccount(id: string) {
  const { user: loggedInUser, session } = await validateRequest();
  if (!loggedInUser) throw new Error("Unauthorized");

  const userId = loggedInUser.id;
  const channels = await streamServerClient.queryChannels(
    { members: { $in: [userId] } },
    { last_message_at: -1 },
  );

  for (const channel of channels) {
    const membersCount = Object.keys(channel.state.members || {}).length;

    if (membersCount > 2) {
      await channel.removeMembers([userId]);

      const updatedChannel = await streamServerClient.channel(
        channel.type,
        channel.id,
      );
      await updatedChannel.watch();
      const remainingMembers = Object.keys(
        updatedChannel.state.members || {},
      ).length;

      if (remainingMembers === 0) {
        await streamServerClient.deleteChannels([updatedChannel.cid], {
          hard_delete: true,
        });
        console.log("channel deleted");
      }
    } else {
      await channel.hide(userId, true);
    }
  }

  await deleteSession(session.id);
  await deleteSessionCookie();

  await prisma.$transaction(async (tx) => {
    (await tx.user.delete({
      where: { id },
    }),
      await streamServerClient.deleteUser(userId, {
        mark_messages_deleted: false,
      }));
  });
}
