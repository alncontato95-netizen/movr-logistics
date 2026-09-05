"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n";

export async function setLocaleAction(formData: FormData) {
  const value = formData.get("locale");
  if (!isLocale(typeof value === "string" ? value : undefined)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE, value as string, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  const h = await headers();
  const referer = h.get("referer");
  let target = "/";
  if (referer) {
    try {
      const url = new URL(referer);
      target = url.pathname + url.search;
    } catch {
      target = "/";
    }
  }
  redirect(target);
}
