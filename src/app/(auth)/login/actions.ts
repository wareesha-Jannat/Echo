"use server";

import { CreateSessionAndSetCookies } from "@/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, LoginValues } from "@/lib/validation";
import { verify } from "argon2";

export async function login(
  credentials: LoginValues,
): Promise<{ error: boolean; message: string }> {
  try {
    const { username, password } = loginSchema.parse(credentials);
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });
    if (!existingUser || !existingUser.passwordHash) {
      return {
        error: true,
        message: "Invalid username or password",
      };
    }

   
    const validPassword = await verify(existingUser.passwordHash, password);
    if (!validPassword) {
      return {
        error: true,
        message: "Invalid username or password",
      };
    }
    await CreateSessionAndSetCookies(existingUser.id);

    return {
      error: false,
      message: "User created successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      error: true,
      message: "Something went wrong. Please try again later",
    };
  }
}
