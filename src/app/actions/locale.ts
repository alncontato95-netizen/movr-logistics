"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n";

export async function setLocaleAction(formData: FormData) {
  const value = formData.get("locale");
  if (!isLocale(typeof value === "string" ? value : undefined)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE, value as string, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}
