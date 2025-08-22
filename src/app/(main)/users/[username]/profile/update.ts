"use server";
import { validateRequest } from "@/auth";
import kyInstance from "@/lib/ky";
import streamServerClient from "@/lib/stream";

export async function UpdateAvatarOnStream(
  avatar: string,
): Promise<{ success: boolean }> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("unauthorized");

    await streamServerClient.partialUpdateUser({
      id: user.id,
      set: {
        image: avatar,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
    };
  }
}
