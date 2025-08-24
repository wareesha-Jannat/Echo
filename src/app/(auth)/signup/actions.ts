"use server";
import { CreateSessionAndSetCookies } from "@/auth";
import { prisma } from "@/lib/prisma";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { hash } from "argon2";
import streamServerClient from "@/lib/stream";

export async function signup(
  credentials: SignUpValues,
): Promise<{ error: boolean; message: string }> {
  try {
    const { username, email, password } = signUpSchema.parse(credentials);
    const passwordHash = await hash(password);

    const googleUser = await prisma.user.findFirst({
      where: {
        AND: [
          {
            email: {
              equals: email,
              mode: "insensitive",
            },
          },
          { googleId: { not: null } },
        ],
      },
    });

    if (googleUser) {
      return {
        error: true,
        message:
          "You already have an account please continue with google to login",
      };
    }

    const existingusername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingusername) {
      return {
        error: true,
        message: "Username already exists",
      };
    }
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });
    if (existingEmail) {
      return {
        error: true,
        message: "Email already taken",
      };
    }

    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          username,
          displayName: username,
          passwordHash,
        },
      });
      await streamServerClient.upsertUser({
        id: createdUser.id,
        username: username,
        name: username,
      });
      return createdUser;
    });

    await CreateSessionAndSetCookies(newUser.id);

    return {
      error: false,
      message: "User created successfully",
    };
  } catch (error) {
    return {
      error: true,
      message: "Something went wrong. Please try again later",
    };
  }
}
