import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui";
import { PollRefresh } from "@/components/poll-refresh";
import { markAllNotificationsRead } from "@/app/actions/notifications";
import { NOTIFICATION_ICONS } from "@/lib/constants";
import { NotificationItem } from "@/components/notification-item";

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
          <h1 className="text-2xl font-bold text-ink">Notificações</h1>
          <p className="mt-1 text-sm text-muted">
            {unread === 0
              ? "Tudo em dia."
              : `${unread} notificação${unread === 1 ? "" : "ões"} não lida${unread === 1 ? "" : "s"}.`}
          </p>
        </div>
        {unread > 0 && (
          <form action={markAllNotificationsRead}>
            <Button type="submit" variant="ghost">
              Marcar todas como lidas
            </Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 p-10 text-center text-sm text-muted">
          Nenhuma notificação ainda. Atualizações sobre suas cargas aparecerão aqui.
        </div>
      ) : (
        <div className="grid gap-3">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              id={n.id}
              loadId={n.loadId}
              isCompany={isCompany}
              read={n.read}
              icon={NOTIFICATION_ICONS[n.type]}
              message={n.message}
              when={formatWhen(n.createdAt)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function formatWhen(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora mesmo";
  if (mins < 60) return `${mins} min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d atrás`;
  return new Date(date).toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}