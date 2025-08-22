"use server";

import { prisma } from "@/lib/prisma";
import { passwordResetSchema, PasswordResetValues } from "@/lib/validation";
import { hash } from "argon2";

export async function SubmitResetPassword({
  values,
  token,
}: {
  values: PasswordResetValues;
  token: string;
}): Promise<{ error: string } | { success: boolean }> {
  try {
    const { password } = passwordResetSchema.parse(values);

    const passwordHash = await hash(password);

    const exisitingToken = await prisma.passwordResetToken.findUnique({
      where: {
        token,
      },
    });

    if (!exisitingToken || exisitingToken.expiresAt < new Date()) {
      return {
        error: "Token not found or is expired",
      };
    }

    await prisma.$transaction([
      prisma.user.update({
        where: {
          email: exisitingToken.email,
        },
        data: {
          passwordHash,
        },
      }),
      prisma.passwordResetToken.delete({
        where: { token },
      }),
    ]);

    return {
      success: true,
    };
  } catch (error) {
    return {
      error: "Something went wrong. Please try again ",
    };
  }
}
