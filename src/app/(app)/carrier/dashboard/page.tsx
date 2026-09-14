import Link from "next/link";
import { requireCarrier } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getDictionary, getLocale } from "@/lib/i18n";
import { filterCompatible } from "@/lib/matching";
import { APPLICATION_STATUS_LABELS, LOAD_STATUS_LABELS } from "@/lib/constants";
import { Card, Badge, LoadStatusBadge } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { ActionCenter } from "@/components/action-center";

export const dynamic = "force-dynamic";

export default async function CarrierDashboardPage() {
  const user = await requireCarrier();
  const locale = await getLocale();
  const t = getDictionary(locale);

  const openLoads = await prisma.load.findMany({
    where: { status: "OPEN" },
    orderBy: { pickupDate: "asc" },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const compatibleLoads = filterCompatible(user as any, openLoads);

  const appCountsRaw = await prisma.application.groupBy({
    by: ["status"],
    where: { transporterId: user.id },
    _count: true,
  });
  const appCountMap = new Map<string, number>();
  for (const g of appCountsRaw) appCountMap.set(g.status, g._count);

  const inTransit = await prisma.application.findMany({
    where: {
      transporterId: user.id,
      status: "ACCEPTED",
      load: { status: { in: ["CONFIRMED", "PICKED_UP", "DELIVERED"] } },
    },
    include: { load: true },
    orderBy: { updatedAt: "desc" },
  });

  const inTransitByStatus = {
    CONFIRMED: inTransit.filter((a) => a.load.status === "CONFIRMED"),
    PICKED_UP: inTransit.filter((a) => a.load.status === "PICKED_UP"),
    DELIVERED: inTransit.filter((a) => a.load.status === "DELIVERED"),
  };

  const historyCount = await prisma.application.count({
    where: {
      transporterId: user.id,
      status: "ACCEPTED",
      load: { status: "COMPLETED" },
    },
  });

  const pendingAccept = await prisma.application.findMany({
    where: { transporterId: user.id, status: "SELECTED" },
    include: { load: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const awaitingPickup = await prisma.application.findMany({
    where: { transporterId: user.id, status: "ACCEPTED", load: { status: "CONFIRMED" } },
    include: { load: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const awaitingDelivery = await prisma.application.findMany({
    where: { transporterId: user.id, status: "ACCEPTED", load: { status: "PICKED_UP" } },
    include: { load: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const hasPending = pendingAccept.length > 0 || awaitingPickup.length > 0 || awaitingDelivery.length > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t.dashboard.title}</h1>
        <p className="mt-1 text-sm text-muted">{t.dashboard.subtitle}</p>
      </div>

      <ActionCenter user={{ id: user.id, role: user.role }} />

      {/* Compatible */}
      <Card>
        <h2 className="text-sm font-semibold text-ink">{t.dashboard.compatibleTitle}</h2>
        <p className="text-xs text-muted">{t.dashboard.compatibleSubtitle}</p>
        <p className="mt-3 text-3xl font-extrabold text-brand">{compatibleLoads.length}</p>
        {compatibleLoads.length === 0 ? (
          <p className="mt-1 text-sm text-muted">{t.dashboard.compatibleEmpty}</p>
        ) : (
          <Link href="/loads" className="mt-2 inline-block text-xs font-semibold text-brand hover:text-brand-dark">
            {t.dashboard.viewAllLoads} →
          </Link>
        )}
      </Card>

      {/* Application counters */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-ink">{t.dashboard.applicationsTitle}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          { (["PENDING","SELECTED","ACCEPTED"] as const).map((s) => (
            <Card key={s} className="p-4 text-center">
              <p className="text-2xl font-extrabold text-ink">{appCountMap.get(s) ?? 0}</p>
              <p className="mt-1 text-xs font-medium text-muted">{APPLICATION_STATUS_LABELS[s]}</p>
              <div className="mt-2 flex justify-center">
                <Badge tone={s==="PENDING" ? "amber" : s==="SELECTED" ? "brand" : "green"}>{APPLICATION_STATUS_LABELS[s]}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* In transit */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-ink">{t.dashboard.inTransitTitle}</h2>
        {inTransit.length === 0 ? (
          <Card><p className="p-2 text-center text-sm text-muted">{t.dashboard.noPendingActions}</p></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {(["CONFIRMED","PICKED_UP","DELIVERED"] as const).map((status) => {
              const list = inTransitByStatus[status];
              if (list.length === 0) return null;
              return (
                <Card key={status} className="p-4">
                  <p className="text-sm font-semibold text-ink">{LOAD_STATUS_LABELS[status]}</p>
                  <p className="text-2xl font-extrabold text-ink">{list.length}</p>
                  <ul className="mt-2 space-y-1">
                    {list.slice(0,3).map((a) => (
                      <li key={a.id} className="text-xs">
                        <Link href={`/loads/${a.loadId}`} className="font-medium text-brand hover:underline">
                          {a.load.origin} → {a.load.destination}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* History */}
      <Card className="flex items-center justify-between p-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">{t.dashboard.historyTitle}</h2>
          <p className="text-xs text-muted">{t.dashboard.subtitle}</p>
        </div>
        <p className="text-3xl font-extrabold text-ink">{historyCount}</p>
      </Card>

      {/* Pending actions */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">{t.dashboard.pendingActionsTitle}</h2>
          <p className="text-xs text-muted">{t.dashboard.compatibleSubtitle}</p>
        </div>

        {!hasPending ? (
          <Card><p className="p-2 text-center text-sm text-muted">{t.dashboard.noPendingActions}</p></Card>
        ) : (
          <div className="space-y-4">
            {pendingAccept.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold text-warning-700">{t.dashboard.awaitingAccept} ({pendingAccept.length})</h3>
                <div className="grid gap-2">
                  {pendingAccept.map((a) => (
                    <Link key={a.id} href={`/loads/${a.loadId}`} className="block rounded-[var(--radius-card)] border border-warning-200 bg-warning-50 p-3 hover:border-warning-300">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-ink">{a.load.origin} → {a.load.destination}</p>
                        <LoadStatusBadge status={a.load.status} locale={locale} />
                      </div>
                      <p className="mt-1 text-xs text-muted">{a.load.cargoType} · {a.load.weightKg} kg {a.load.priceEur ? `· ${formatMoney(a.load.priceEur, locale)}` : ""}</p>
                      <p className="mt-2 text-xs font-semibold text-brand">{t.dashboard.viewLoad} →</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {awaitingPickup.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold text-info-700">{t.dashboard.awaitingPickup} ({awaitingPickup.length})</h3>
                <div className="grid gap-2">
                  {awaitingPickup.map((a) => (
                    <Link key={a.id} href={`/loads/${a.loadId}`} className="block rounded-[var(--radius-card)] border border-info-200 bg-info-50 p-3 hover:border-info-300">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-ink">{a.load.origin} → {a.load.destination}</p>
                        <LoadStatusBadge status={a.load.status} locale={locale} />
                      </div>
                      <p className="mt-2 text-xs font-semibold text-brand">{t.dashboard.viewLoad} →</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {awaitingDelivery.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold text-success-700">{t.dashboard.awaitingDelivery} ({awaitingDelivery.length})</h3>
                <div className="grid gap-2">
                  {awaitingDelivery.map((a) => (
                    <Link key={a.id} href={`/loads/${a.loadId}`} className="block rounded-[var(--radius-card)] border border-success-200 bg-success-light p-3 hover:border-success-300">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-ink">{a.load.origin} → {a.load.destination}</p>
                        <LoadStatusBadge status={a.load.status} locale={locale} />
                      </div>
                      <p className="mt-2 text-xs font-semibold text-brand">{t.dashboard.viewLoad} →</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
