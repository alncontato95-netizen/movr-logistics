"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { markAllRead } from "@/lib/notify";

export async function markAllNotificationsRead() {
  const user = await getCurrentUser();
  await markAllRead(user.id);
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
  redirect("/notifications");
}
