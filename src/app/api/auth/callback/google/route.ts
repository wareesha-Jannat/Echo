import { CreateSessionAndSetCookies, google } from "@/auth";
import kyInstance from "@/lib/ky";
import { prisma } from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { slugify } from "@/lib/utils";
import { OAuth2RequestError } from "arctic";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieStore = await cookies();

  const storedState = cookieStore.get("state")?.value;
  const storedCodeVerifier = cookieStore.get("code_verifier")?.value;

  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    );

    const googleUser = await kyInstance
      .get("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      })
      .json<{ id: string; name: string; email: string }>();

    let existingUser = await prisma.user.findUnique({
      where: {
        googleId: googleUser.id,
      },
    });

    if (existingUser) {
      await CreateSessionAndSetCookies(existingUser.id);
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (!existingUser && googleUser.email) {
      const oldUser = await prisma.user.findUnique({
        where: { email: googleUser.email },
      });

      if (oldUser) {
        // Update the user to link their Google account
        await prisma.user.update({
          where: { id: oldUser.id },
          data: {
            googleId: googleUser.id,
          },
        });
        await CreateSessionAndSetCookies(oldUser.id);
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    const username = slugify(googleUser.name);

    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          username,
          displayName: googleUser.name,
          googleId: googleUser.id,
        },
      });
      const newUsername = username + "-" + createdUser.id.slice(0, 4);
      await tx.user.update({
        where: {
          id: createdUser.id,
        },
        data: {
          username: newUsername,
        },
      });

      await streamServerClient.upsertUser({
        id: createdUser.id,
        username: newUsername,
        name: googleUser.name,
      });
      return createdUser;
    });

    await CreateSessionAndSetCookies(newUser.id);

    return NextResponse.redirect(new URL("/", req.url));
  } catch (error) {
    console.error("Google Callback Error:", error);
    if (error instanceof OAuth2RequestError) {
      return new NextResponse(null, {
        status: 400,
      });
    }
    return new NextResponse(null, {
      status: 500,
    });
  }
}
