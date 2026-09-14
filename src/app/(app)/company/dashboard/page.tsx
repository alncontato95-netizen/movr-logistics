import Link from "next/link";
import { requireCompany } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getDictionary, getLocale } from "@/lib/i18n";
import { getLoadStatusLabels } from "@/lib/constants";
import { Card, Badge, LoadStatusBadge } from "@/components/ui";
import { NOTIFICATION_ICONS } from "@/lib/constants";
import { formatMoney, formatMonthDay } from "@/lib/format";
import { ActionCenter } from "@/components/action-center";

export const dynamic = "force-dynamic";

export default async function CompanyDashboardPage() {
  const user = await requireCompany();
  const locale = await getLocale();
  const t = getDictionary(locale);
  const company = await prisma.company.findUnique({ where: { userId: user.id } });

  if (!company) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold text-ink">{t.dashboard.title}</h1>
        <p className="text-sm text-muted">{t.dashboard.subtitle}</p>
        <Card>
          <p className="text-sm text-muted">Configure seus dados empresariais primeiro.</p>
          <Link href="/company/settings" className="mt-3 inline-block text-sm font-semibold text-brand underline">
            {t.nav.business}
          </Link>
        </Card>
      </div>
    );
  }

  const statusCounts = await prisma.load.groupBy({
    by: ["status"],
    where: { companyId: company.id },
    _count: true,
  });

  const countMap = new Map<string, number>();
  for (const g of statusCounts) {
    countMap.set(g.status, g._count);
  }
  const allStatuses = ["OPEN", "SELECTED", "CONFIRMED", "PICKED_UP", "DELIVERED", "COMPLETED", "CANCELLED"] as const;

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { load: true },
    take: 5,
  });

  const attentionSelected = await prisma.load.findMany({
    where: { companyId: company.id, status: "SELECTED" },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const attentionDelivered = await prisma.load.findMany({
    where: { companyId: company.id, status: "DELIVERED" },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const statusLabels = getLoadStatusLabels(locale);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-ink">{t.dashboard.title}</h1>
        <p className="mt-0.5 text-[13px] text-muted">{t.dashboard.subtitle}</p>
      </div>

      <ActionCenter user={{ id: user.id, role: user.role }} />

      {/* Counters */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-ink">{t.dashboard.countersTitle}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {allStatuses.map((s) => (
            <Card key={s} className="p-4 text-center">
              <p className="text-2xl font-extrabold text-ink">{countMap.get(s) ?? 0}</p>
              <p className="mt-1 text-xs font-medium text-muted">{statusLabels[s]}</p>
              <div className="mt-2 flex justify-center">
                <Badge tone={s === "OPEN" ? "brand" : s === "SELECTED" ? "amber" : s === "CONFIRMED" || s === "PICKED_UP" ? "blue" : s === "DELIVERED" ? "green" : "neutral"}>
                  {statusLabels[s]}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent activity */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">{t.dashboard.recentActivityTitle}</h2>
            <Link href="/notifications" className="text-xs font-semibold text-brand hover:text-brand-dark">
              {t.dashboard.viewAllNotifications}
            </Link>
          </div>
          <Card className="p-0">
            {notifications.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted">{t.dashboard.noRecentActivity}</p>
            ) : (
              <ul className="divide-y divide-border">
                {notifications.map((n) => (
                  <li key={n.id} className="flex items-start gap-3 p-4">
                    <span className="mt-0.5 text-base" aria-hidden>
                      {NOTIFICATION_ICONS[n.type]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{n.message}</p>
                      <p className="mt-0.5 text-xs text-muted">{formatMonthDay(n.createdAt, locale)}</p>
                    </div>
                    {!n.read && <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white">Nova</span>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        {/* Attention */}
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">{t.dashboard.attentionTitle}</h2>
            <p className="text-xs text-muted">{t.dashboard.attentionSubtitle}</p>
          </div>

          {attentionSelected.length === 0 && attentionDelivered.length === 0 ? (
            <Card>
              <p className="p-2 text-center text-sm text-muted">{t.dashboard.emptyAttention}</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {attentionSelected.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold text-warning-700">{t.dashboard.awaitingCarrier} ({attentionSelected.length})</h3>
                  <div className="grid gap-2">
                    {attentionSelected.map((load) => (
                      <Link key={load.id} href={`/company/loads/${load.id}`} className="block rounded-[var(--radius-card)] border border-warning-200 bg-warning-50 p-3 hover:border-warning-300">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-ink">
                            {load.origin} → {load.destination}
                          </p>
                          <LoadStatusBadge status={load.status} locale={locale} />
                        </div>
                        <p className="mt-1 text-xs text-muted">{load.cargoType} · {load.weightKg} kg {load.priceEur ? `· ${formatMoney(load.priceEur, locale)}` : ""}</p>
                        <p className="mt-2 text-xs font-semibold text-brand">{t.dashboard.viewLoad} →</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {attentionDelivered.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold text-success-700">{t.dashboard.awaitingCompletion} ({attentionDelivered.length})</h3>
                  <div className="grid gap-2">
                    {attentionDelivered.map((load) => (
                      <Link key={load.id} href={`/company/loads/${load.id}`} className="block rounded-[var(--radius-card)] border border-success-200 bg-success-light p-3 hover:border-success-300">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-ink">
                            {load.origin} → {load.destination}
                          </p>
                          <LoadStatusBadge status={load.status} locale={locale} />
                        </div>
                        <p className="mt-1 text-xs text-muted">{load.cargoType} · {load.weightKg} kg {load.priceEur ? `· ${formatMoney(load.priceEur, locale)}` : ""}</p>
                        <p className="mt-2 text-xs font-semibold text-brand">{t.dashboard.viewLoad} →</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Link href="/company/loads" className="inline-block text-xs font-semibold text-brand hover:text-brand-dark">
            {t.dashboard.viewAllLoads} →
          </Link>
        </section>
      </div>
    </div>
  );
}
