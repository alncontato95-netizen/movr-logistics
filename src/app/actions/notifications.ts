"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { markAllRead, markRead } from "@/lib/notify";

export async function markAllNotificationsRead() {
  const user = await getCurrentUser();
  await markAllRead(user.id);
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
  redirect("/notifications");
}

export async function markNotificationRead(formData: FormData) {
  const user = await getCurrentUser();
  const notificationId = formData.get("notificationId") as string;
  if (!notificationId) return;
  await markRead(notificationId, user.id);
}
