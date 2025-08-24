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

  await deleteSession(session.id);
  await deleteSessionCookie();

  await prisma.$transaction(async (tx) => {
    (await tx.user.delete({
      where: { id },
    }),
      // 1. Anonymize user in Stream
      await streamServerClient.upsertUser({
        id: userId,
        name: "Deleted User",
        image: undefined,
      }),
      // 2. Soft delete in Stream (keeps messages)
      await streamServerClient.deleteUser(userId, {
        hard_delete: false,
        mark_messages_deleted: false,
      }));
  });
}
