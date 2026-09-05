import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "movr_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
function getSecret(): Uint8Array {
  const raw = process.env.SESSION_SECRET;
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET is not set");
    }
    return new TextEncoder().encode("dev-only-insecure-session-secret-change-me");
  }
  return new TextEncoder().encode(raw);
}
const SECRET = getSecret();

type SessionToken = { sid: string };

export type SessionUser = {
  userId: string;
  role: "CARRIER" | "COMPANY";
  name: string;
};

export async function createSession(user: { id: string; role: "CARRIER" | "COMPANY"; name: string }) {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const session = await prisma.session.create({
    data: { userId: user.id, expiresAt },
  });

  const token = await new SignJWT({ sid: session.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  let payload: SessionToken;
  try {
    const { payload: p } = await jwtVerify(token, SECRET);
    payload = p as SessionToken;
  } catch {
    return null;
  }

  if (!payload.sid) return null;

  const session = await prisma.session.findUnique({ where: { id: payload.sid }, include: { user: true } });
  if (!session) return null;
  if (session.revoked) return null;
  if (session.expiresAt.getTime() < Date.now()) return null;

  return { userId: session.user.id, role: session.user.role, name: session.user.name };
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      const sid = (payload as SessionToken).sid;
      if (sid) {
        await prisma.session.updateMany({ where: { id: sid }, data: { revoked: true } }).catch(() => {});
      }
    } catch {
      // ignore invalid token
    }
  }

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function revokeAllUserSessions(userId: string) {
  await prisma.session.updateMany({ where: { userId }, data: { revoked: true } });
}
