import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCarrier } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { applyToLoad, cancelApplication } from "@/app/actions/loads";
import { Badge, LoadStatusBadge } from "@/components/ui";
import { CARGO_LABELS, VEHICLE_LABELS } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function LoadDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ applied?: string }> }) {
  const [{ id }, { applied }] = await Promise.all([params, searchParams]);
  const user = await requireCarrier();

  const load = await prisma.load.findUnique({
    where: { id },
    include: { company: { include: { user: true } } },
  });
  if (!load) notFound();

  const myApplication = await prisma.application.findUnique({
    where: { loadId_transporterId: { loadId: load.id, transporterId: user.id } },
  });

  const isOpen = load.status === "OPEN";
  const canApply = isOpen && (!myApplication || myApplication.status === "CANCELLED");
  const appliedPending = myApplication?.status === "PENDING";

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/loads" className="text-sm font-medium text-muted hover:text-ink">
        ← Back to loads
      </Link>

      {applied && appliedPending && (
        <div className="rounded-2xl bg-brand-light p-4 text-sm font-semibold text-brand-dark">
          Interest sent. The company will review all applications and select their carrier.
        </div>
      )}

      <div className="rounded-2xl border border-black/8 bg-white p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-ink">
            {load.origin} <span className="text-brand-dark">→</span> {load.destination}
          </h1>
          <LoadStatusBadge status={load.status} />
        </div>
        <p className="mt-1 text-muted">Pickup {formatDate(load.pickupDate)}</p>

        <dl className="mt-6 space-y-3 text-sm">
          <Row label="Cargo type" value={CARGO_LABELS[load.cargoType]} />
          <Row label="Weight" value={`${load.weightKg} kg${load.volumeM3 ? ` · ${load.volumeM3} m³` : ""}`} />
          {load.requiredVehicle ? (
            <Row label="Required vehicle" value={VEHICLE_LABELS[load.requiredVehicle]} />
          ) : (
            <Row label="Required vehicle" value="Any" />
          )}
          {load.priceEur ? <Row label="Offered price" value={formatMoney(load.priceEur)} /> : null}
          <Row label="Pricing" value={load.priceNegotiable ? "Negotiable" : "Fixed"} />
          {load.pickupWindow ? <Row label="Pickup window" value={load.pickupWindow} /> : null}
          {load.notes ? <Row label="Notes" value={load.notes} /> : null}
        </dl>
      </div>

      <div className="rounded-2xl border border-black/8 bg-white p-6">
        <p className="text-sm font-semibold text-muted">Published by</p>
        <p className="mt-1 font-semibold text-ink">{load.company.user.name}</p>
        {load.company.name && <p className="text-sm text-muted">{load.company.name}</p>}
      </div>

      <div className="sticky bottom-4">
        {appliedPending ? (
          <form action={cancelApplication}>
            <input type="hidden" name="loadId" value={load.id} />
            <button
              type="submit"
              className="w-full rounded-xl border border-black/10 bg-white py-3.5 text-sm font-semibold text-ink hover:border-red-400 hover:text-red-600"
            >
              Withdraw interest
            </button>
          </form>
        ) : canApply ? (
          <form action={applyToLoad}>
            <input type="hidden" name="loadId" value={load.id} />
            <button
              type="submit"
              className="w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/30 hover:bg-brand-dark"
            >
              Show interest in this load
            </button>
          </form>
        ) : (
          <div className="rounded-xl bg-black/5 py-3.5 text-center text-sm font-semibold text-muted">
            {myApplication?.status === "SELECTED" ? (
              <Badge tone="brand">Selected — the company chose you</Badge>
            ) : myApplication?.status === "REJECTED" ? (
              <Badge tone="red">Not selected for this load</Badge>
            ) : (
              <Badge>Not open for applications</Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
