"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, loginSchema } from "@/lib/validation";
import { createSession, destroySession } from "@/lib/session";
import { clientIp, rateLimit, isLocked, recordFailure } from "@/lib/rate-limit";
import type { Role } from "@/generated/prisma/client";

export type AuthState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
} | undefined;

const IP_WINDOW_MS = 15 * 60 * 1000;
const EMAIL_WINDOW_MS = 15 * 60 * 1000;

export async function register(_state: AuthState, formData: FormData): Promise<AuthState> {
  const ip = await clientIp();
  const ipLimit = await isLocked(ip, { max: 8, windowMs: IP_WINDOW_MS });
  if (!ipLimit.ok) {
    return { message: "Too many attempts. Please try again in a few minutes." };
  }

  const rawRole = formData.get("role") as string;
  const role = rawRole === "COMPANY" ? "COMPANY" : "CARRIER";

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  // Record the attempt against the global IP cap only after validation passes
  // (invalid input is cheap; this protects against mass account creation).
  const ipConsume = await rateLimit(ip, { max: 8, windowMs: IP_WINDOW_MS });
  if (!ipConsume.ok) {
    return { message: "Too many attempts. Please try again in a few minutes." };
  }

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { errors: { email: ["An account with this email already exists."] } };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: role as Role },
  });

  await createSession({ id: user.id, role: user.role, name: user.name });

  if (role === "COMPANY") redirect("/company/settings");
  redirect("/profile");
}

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const ip = await clientIp();
  const ipLimit = await isLocked(ip, { max: 20, windowMs: IP_WINDOW_MS });
  if (!ipLimit.ok) {
    return { message: "Too many attempts. Please try again in a few minutes." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  const emailLock = await isLocked(`login:${email.toLowerCase()}`, { max: 5, windowMs: EMAIL_WINDOW_MS });
  if (!emailLock.ok) {
    return { message: "Too many failed attempts for this account. Try again later." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await recordFailure(`login:${email.toLowerCase()}`, EMAIL_WINDOW_MS);
    return { message: "Invalid email or password." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    await recordFailure(`login:${email.toLowerCase()}`, EMAIL_WINDOW_MS);
    return { message: "Invalid email or password." };
  }

  await createSession({ id: user.id, role: user.role, name: user.name });

  if (user.role === "COMPANY") redirect("/company/loads");
  redirect("/loads");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
