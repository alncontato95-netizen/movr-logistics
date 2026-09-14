import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCarrier } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { applyToLoad, cancelApplication, acceptOffer, declineOffer, confirmPickup, confirmDelivery } from "@/app/actions/loads";
import { PollRefresh } from "@/components/poll-refresh";
import { PodUpload } from "@/components/pod-upload";
import { LoadLifecycle, OperationPanel } from "@/components/load-lifecycle";
import { Badge, LoadStatusBadge } from "@/components/ui";
import { CARGO_LABELS, VEHICLE_LABELS } from "@/lib/constants";
import { formatDate, formatDayTime, formatMoney } from "@/lib/format";
import { canConfirmPickup, pickupReadyAt } from "@/lib/schedule";
import { RouteMap } from "@/components/route-map-wrapper";
import { getDictionary, getLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function LoadDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ applied?: string; accepted?: string; declined?: string; "picked-up"?: string; delivered?: string; "pod-error"?: string; "early-pickup"?: string }> }) {
  const [{ id }, { applied, accepted, declined, "picked-up": pickedUp, delivered, "pod-error": podError, "early-pickup": earlyPickup }] = await Promise.all([params, searchParams]);
  const user = await requireCarrier();

  const load = await prisma.load.findUnique({
    where: { id },
    include: { company: { include: { user: true } } },
  });
  if (!load) notFound();

  const myApplication = await prisma.application.findUnique({
    where: { loadId_transporterId: { loadId: load.id, transporterId: user.id } },
  });

  const rating = load.status === "COMPLETED" ? await prisma.rating.findUnique({ where: { loadId: load.id } }) : null;
  const locale = await getLocale();
  const t = getDictionary(locale);

  const isOpen = load.status === "OPEN";
  const canApply = isOpen && (!myApplication || myApplication.status === "CANCELLED");
  const appliedPending = myApplication?.status === "PENDING";

  const activeParticipation = !!myApplication && ["PENDING", "SELECTED", "ACCEPTED"].includes(myApplication.status);
  const selectedByCompany = myApplication?.status === "SELECTED" || myApplication?.status === "ACCEPTED";
  const operationalStatus =
    myApplication?.status === "ACCEPTED" &&
    (load.status === "CONFIRMED" || load.status === "PICKED_UP" || load.status === "DELIVERED")
      ? load.status
      : null;

  const pickupReady = canConfirmPickup(load.pickupDate, load.pickupWindow);
  const pickupReadyMoment = pickupReadyAt(load.pickupDate, load.pickupWindow);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PollRefresh intervalMs={10000} />
      <Link href="/loads" className="text-sm font-medium text-muted hover:text-ink">
        ← Back to loads
      </Link>

      {applied && appliedPending && (
        <div className="rounded-2xl bg-brand-light p-4 text-sm font-semibold text-brand-dark">
          Interest sent. The company will review all applications and select their carrier.
        </div>
      )}

      {podError && (
        <div className="rounded-2xl bg-error-light p-4 text-sm font-semibold text-error">
          POD upload failed. Use a JPG/PNG/WebP image or PDF up to 5MB, or a valid https:// link.
        </div>
      )}

      {earlyPickup && (
        <div className="rounded-2xl bg-warning-50 p-4 text-sm font-semibold text-warning-800">
          {t.journey.earlyPickup}
        </div>
      )}

      {accepted && (
        <div className="rounded-2xl bg-success-light p-4 text-sm font-semibold text-success-700">
          Offer accepted. The company will confirm the booking.
        </div>
      )}

      {declined && (
        <div className="rounded-2xl bg-error-light p-4 text-sm font-semibold text-error-700">
          You declined the offer. This load is open for other carriers.
        </div>
      )}

      {pickedUp && (
        <div className="rounded-2xl bg-info-50 p-4 text-sm font-semibold text-info-800">
          Pickup confirmed. The load is on its way.
        </div>
      )}

      {delivered && (
        <div className="rounded-2xl bg-success-light p-4 text-sm font-semibold text-success-700">
          Delivery confirmed. Awaiting company confirmation.
        </div>
      )}

      <div className="rounded-2xl border border-black/8 bg-white p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-ink">
            {load.origin} <span className="text-brand-dark">→</span> {load.destination}
          </h1>
          <LoadStatusBadge status={load.status} locale={locale} />
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

      {activeParticipation && load.status !== "OPEN" && load.status !== "CANCELLED" && (
        <LoadLifecycle status={load.status} applied selected={selectedByCompany} locale={locale} />
      )}

      {operationalStatus && (
        <OperationPanel
          status={operationalStatus}
          origin={load.origin}
          destination={load.destination}
          pickupDate={load.pickupDate}
          pickupWindow={load.pickupWindow}
          locale={locale}
        />
      )}

      <div className="space-y-1">
        <RouteMap origin={load.origin} destination={load.destination} />
        <p className="text-center text-xs text-muted">{t.loads.approximateRoute}</p>
      </div>

      <div className="rounded-2xl border border-black/8 bg-white p-6">
        <p className="text-sm font-semibold text-muted">Published by</p>
        <p className="mt-1 font-semibold text-ink">{load.company.user.name}</p>
        {load.company.name && <p className="text-sm text-muted">{load.company.name}</p>}
        {myApplication &&
          (myApplication.status === "SELECTED" ||
            myApplication.status === "ACCEPTED" ||
            load.status === "CONFIRMED" ||
            load.status === "PICKED_UP" ||
            load.status === "DELIVERED") && (
            <div className="mt-3 rounded-xl bg-brand-light/60 p-3 text-sm">
              <p className="font-semibold text-brand-dark">Contact details</p>
              {load.company.phone && <p className="mt-1 break-words text-ink">Phone: {load.company.phone}</p>}
              {load.company.user.email && <p className="break-all text-ink">Email: {load.company.user.email}</p>}
              <p className="mt-1 text-xs text-muted">Contact to arrange pickup — they&apos;re expecting to hear from you about this load.</p>
            </div>
          )}
      </div>

      {load.podUrl && (
        <div className="rounded-2xl border border-success-200 bg-success-light p-4">
          <p className="font-semibold text-success-700">Proof of delivery</p>
          <a href={load.podUrl} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-success-700 underline">
            {load.podUrl}
          </a>
          {load.podNote && <p className="mt-1 text-sm text-muted">{load.podNote}</p>}
        </div>
      )}

      {load.status === "COMPLETED" && rating && (
        <div className="rounded-2xl border border-black/8 bg-white p-4 text-center">
          <p className="font-semibold text-ink">Your rating: ★ {rating.score}</p>
          {rating.comment && <p className="mt-1 text-sm text-muted">{rating.comment}</p>}
        </div>
      )}

      {myApplication?.status === "ACCEPTED" && (load.status === "PICKED_UP" || load.status === "DELIVERED") && !load.podUrl && (
        <PodUpload loadId={load.id} />
      )}

      <div className="sticky bottom-4 z-[45] rounded-2xl bg-surface/90 p-2 shadow-[0_8px_24px_rgba(5,5,7,0.10)] backdrop-blur-xl">
        {myApplication?.status === "SELECTED" ? (
          <div className="space-y-2">
            <p className="rounded-xl bg-warning-50 p-3 text-center text-sm font-semibold text-warning-800">
              The company selected you for this load. Accept the offer to book it.
            </p>
            <div className="flex gap-2">
              <form action={declineOffer} className="flex-1">
                <input type="hidden" name="loadId" value={load.id} />
                <button
                  type="submit"
                  className="w-full rounded-xl border border-black/10 bg-white py-3.5 text-sm font-semibold text-ink hover:border-error-400 hover:text-error-600"
                >
                  Decline
                </button>
              </form>
              <form action={acceptOffer} className="flex-1">
                <input type="hidden" name="loadId" value={load.id} />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/30 hover:bg-brand-dark"
                >
                  Accept offer
                </button>
              </form>
            </div>
          </div>
        ) : load.status === "CONFIRMED" && myApplication?.status === "ACCEPTED" ? (
          pickupReady ? (
            <form action={confirmPickup}>
              <input type="hidden" name="loadId" value={load.id} />
              <button
                type="submit"
                className="w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/30 hover:bg-brand-dark"
              >
                {t.actionCenter.confirmPickup}
              </button>
            </form>
          ) : (
            <div className="space-y-1.5">
              <p className="rounded-xl bg-brand-light/60 px-3 py-2 text-center text-xs font-semibold text-brand-dark">
                {t.journey.pickupOpensAt} {formatDayTime(pickupReadyMoment, locale)}
              </p>
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-xl bg-black/10 py-3.5 text-sm font-semibold text-black/40"
              >
                {t.actionCenter.confirmPickup}
              </button>
            </div>
          )
        ) : load.status === "PICKED_UP" && myApplication?.status === "ACCEPTED" ? (
          <form action={confirmDelivery}>
            <input type="hidden" name="loadId" value={load.id} />
            <button
              type="submit"
              className="w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/30 hover:bg-brand-dark"
            >
              Confirm delivery
            </button>
          </form>
        ) : appliedPending ? (
          <form action={cancelApplication}>
            <input type="hidden" name="loadId" value={load.id} />
            <button
              type="submit"
              className="w-full rounded-xl border border-black/10 bg-white py-3.5 text-sm font-semibold text-ink hover:border-error-400 hover:text-error-600"
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
            {myApplication?.status === "ACCEPTED" && load.status === "DELIVERED" ? (
              <Badge tone="green">Delivered — awaiting company confirmation</Badge>
            ) : myApplication?.status === "ACCEPTED" ? (
              <Badge tone="green">Offer accepted — the company can now confirm the booking</Badge>
            ) : myApplication?.status === "DECLINED" ? (
              <Badge tone="red">You declined this offer — it&apos;s open for other carriers</Badge>
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
