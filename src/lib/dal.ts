import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/client";

export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }
  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  if (!user) {
    redirect("/login");
  }
  return user;
});

export async function requireRole(...roles: Role[]) {
  const user = await getCurrentUser();
  if (!roles.includes(user.role)) {
    redirect("/login");
  }
  return user;
}

export async function requireCarrier() {
  return requireRole("CARRIER");
}

export async function requireCompany() {
  return requireRole("COMPANY");
}
