import { prisma } from "./lib/prisma";

import { Google } from "arctic";
import { cache } from "react";
import { cookies } from "next/headers";
import { Session } from "@prisma/client";
import { SessionAuth, UserAuth } from "./lib/types";

const sessionExpiresInSeconds = 60 * 60 * 24; // 1 day

interface SessionWithToken extends Session {
  token: string;
}

interface Result {
  session: SessionAuth;
  user: UserAuth;
}

interface SessionWithUser extends Session {
  user: UserAuth;
}

export async function CreateSessionAndSetCookies(userId: string) {
  const cookieStore = await cookies();
  const session = await createSession(userId);
  const sessionCookie = createSessionCookie(session);
  cookieStore.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
}
export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`,
);


function generateSecureRandomString(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz23456789";
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);

  let id = "";
  for (let i = 0; i < bytes.length; i++) {
    id += alphabet[bytes[i] & 31];
  }
  return id;
}


async function hashSecret(secret: string): Promise<Uint8Array> {
  const secretBytes = new TextEncoder().encode(secret);
  const secretHashBuffer = await crypto.subtle.digest("SHA-256", secretBytes);
  return new Uint8Array(secretHashBuffer);
}


async function createSession(userId: string): Promise<SessionWithToken> {
  const now = new Date();
  const id = generateSecureRandomString();
  const secret = generateSecureRandomString();
  const secretHash = await hashSecret(secret);

  const token = id + "." + secret;
  const expiresAt = new Date(Date.now() + sessionExpiresInSeconds * 1000);
  const secretHashBuffer = Buffer.from(secretHash);
  const session: SessionWithToken = {
    id,
    createdAt: now,
    secretHash: secretHashBuffer,
    token,
    expiresAt,
    userId,
  };
  await prisma.session.create({
    data: {
      id,
      secretHash: secretHashBuffer,
      createdAt: now,
      expiresAt,
      userId,
    },
  });

  return session;
}


function createSessionCookie(session: SessionWithToken) {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    name: "session_token",
    value: session.token,
    attributes: {
      httpOnly: true,
      sameSite: "lax" as "lax",
      secure: isProduction,
      path: "/",
      expires: session.expiresAt,
    },
  };
}


export function clearSessionCookie() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    name: "session_token",
    value: "",
    attributes: {
      httpOnly: true,
      sameSite: "lax" as "lax",
      secure: isProd,
      path: "/",
      maxAge: 0,
    },
  };
}



export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  const sessionCookie = clearSessionCookie();
  cookieStore.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
}


async function validateSession(
  sessionId: string,
): Promise<SessionWithUser | null> {
  const now = new Date();

  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          googleId: true,
          avatarUrl: true,
        },
      },
    },
  });
  if (!session) {
    return null;
  }

  // Check expiration
  if (now >= session.expiresAt) {
    await deleteSession(sessionId);
    return null;
  }

  return session;
}


export async function deleteSession(sessionId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      id: sessionId,
    },
  });
}


function compareTokens(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) {
    return false;
  }

  let c = 0;
  for (let i = 0; i < a.byteLength; i++) {
    c |= a[i] ^ b[i];
  }
  return c === 0;
}


async function validateSessionToken(token: string): Promise<Result | null> {
  const tokenParts = token.split(".");
  if (tokenParts.length !== 2) {
    return null;
  }

  const sessionId = tokenParts[0];
  const sessionSecret = tokenParts[1];

  const session = await validateSession(sessionId);
  if (!session) {
    return null;
  }

  const tokenSecretHash = await hashSecret(sessionSecret);

  //  const uint8Array = new Uint8Array(buffer);
  const validSecret = compareTokens(tokenSecretHash, new Uint8Array(session.secretHash));
  if (!validSecret) {
    await deleteSession(session.id);
    return null;
  }
  const result: Result = {
    session: {
      id: session.id,
    },
    user: {
      id: session.user.id,
      username: session.user.username,
      displayName: session.user.displayName,
      avatarUrl: session.user.avatarUrl,
      googleId: session.user.googleId,
    },
  };
  return result;
}

export const validateRequest = cache(
  async (): Promise<
    { user: UserAuth; session: SessionAuth } | { user: null; session: null }
  > => {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value ?? null;
    if (!sessionToken) {
      return {
        user: null,
        session: null,
      };
    }
    try {
      const result = await validateSessionToken(sessionToken);

      if (!result) {
        await deleteSessionCookie();
        return { session: null, user: null };
      }
      return {
        user: result.user,
        session: result.session,
      };
    } catch (error) {
      return { session: null, user: null };
    }
  },
);
