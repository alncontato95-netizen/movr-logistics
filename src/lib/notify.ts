import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@/generated/prisma/client";

export async function createNotification({
  userId,
  loadId,
  type,
  message,
}: {
  userId: string;
  loadId: string;
  type: NotificationType;
  message: string;
}) {
  await prisma.notification.create({
    data: { userId, loadId, type, message },
  });
}

export async function unreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
}
