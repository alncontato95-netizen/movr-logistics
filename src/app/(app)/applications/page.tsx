import { requireCarrier } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ApplicationStatusBadge, Card } from "@/components/ui";
import { PollRefresh } from "@/components/poll-refresh";
import { formatDate } from "@/lib/format";
import { CARGO_LABELS } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const user = await requireCarrier();

  const applications = await prisma.application.findMany({
    where: { transporterId: user.id },
    orderBy: { createdAt: "desc" },
    include: { load: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PollRefresh intervalMs={15000} />
      <div>
        <h1 className="text-2xl font-bold text-ink">My applications</h1>
        <p className="mt-1 text-sm text-muted">Track the loads you showed interest in.</p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 p-10 text-center text-sm text-muted">
          You haven&apos;t shown interest in any loads yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {applications.map((app) => (
            <Link key={app.id} href={`/loads/${app.loadId}`} className="block">
              <Card className="transition-colors hover:border-brand">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">
                      {app.load.origin} <span className="text-muted">→</span> {app.load.destination}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">
                      {formatDate(app.load.pickupDate)} · {CARGO_LABELS[app.load.cargoType]} · {app.load.weightKg} kg
                    </p>
                  </div>
                  <ApplicationStatusBadge status={app.status} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
