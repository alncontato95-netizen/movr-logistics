import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Card, Button } from "@/components/ui";
import { PollRefresh } from "@/components/poll-refresh";
import { markAllNotificationsRead } from "@/app/actions/notifications";
import { NOTIFICATION_ICONS } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  const isCompany = user.role === "COMPANY";

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { load: true },
    take: 100,
  });
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PollRefresh intervalMs={15000} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Notifications</h1>
          <p className="mt-1 text-sm text-muted">
            {unread === 0
              ? "You're all caught up."
              : `${unread} unread notification${unread === 1 ? "" : "s"}.`}
          </p>
        </div>
        {unread > 0 && (
          <form action={markAllNotificationsRead}>
            <Button type="submit" variant="ghost">
              Mark all as read
            </Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 p-10 text-center text-sm text-muted">
          No notifications yet. Updates about your loads will appear here.
        </div>
      ) : (
        <div className="grid gap-3">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={isCompany ? `/company/loads/${n.loadId}` : `/loads/${n.loadId}`}
              className="block"
            >
              <Card className={`transition-colors hover:border-brand ${n.read ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-lg" aria-hidden>
                      {NOTIFICATION_ICONS[n.type]}
                    </span>
                    <div>
                      <p className="font-medium text-ink">{n.message}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {formatWhen(n.createdAt)}
                        {!n.read && (
                          <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white">
                            New
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function formatWhen(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
