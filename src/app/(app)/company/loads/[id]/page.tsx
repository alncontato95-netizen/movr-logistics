import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCompany } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { regionsFor } from "@/lib/matching";
import { selectTransporter, undoSelection, updateLoadStatus } from "@/app/actions/loads";
import { Badge, LoadStatusBadge } from "@/components/ui";
import { CARGO_LABELS, VEHICLE_LABELS, LOAD_STATUS_LABELS, type VehicleType } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CompanyLoadDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ selected?: string; undone?: string; "awaiting-acceptance"?: string }> }) {
  const [{ id }, { selected, undone, "awaiting-acceptance": awaitingAcceptance }] = await Promise.all([params, searchParams]);
  const user = await requireCompany();
  const company = await prisma.company.findUnique({ where: { userId: user.id } });

  const load = await prisma.load.findUnique({
    where: { id },
    include: { applications: { include: { transporter: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!load || !company || load.companyId !== company.id) notFound();

  const pending = load.applications.filter((a) => a.status === "PENDING");
  const chosen = load.applications.find((a) => a.status === "SELECTED" || a.status === "ACCEPTED" || a.status === "DECLINED");
  const rejected = load.applications.filter((a) => a.status === "REJECTED");

  const showSelect = load.status === "OPEN";
  const carrierAccepted = chosen?.status === "ACCEPTED";
  const progressStatus =
    load.status === "SELECTED" || load.status === "CONFIRMED" || load.status === "IN_TRANSIT" ? load.status : null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/company/loads" className="text-sm font-medium text-muted hover:text-ink">
        ← Back to your loads
      </Link>

      {selected && chosen && (
        <div className="rounded-2xl bg-brand-light p-4 text-sm font-semibold text-brand-dark">
          {chosen.transporter.name.split(" ")[0]} selected. The load is now reserved for them — awaiting their acceptance.
        </div>
      )}

      {undone && (
        <div className="rounded-2xl bg-brand-light p-4 text-sm font-semibold text-brand-dark">
          Selection undone. The load is open for applications again.
        </div>
      )}

      {awaitingAcceptance && (
        <div className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          The booking can&apos;t be confirmed yet — the selected carrier must accept the offer first.
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
          <Row label="Required vehicle" value={load.requiredVehicle ? VEHICLE_LABELS[load.requiredVehicle] : "Any"} />
          {load.priceEur ? <Row label="Offered price" value={formatMoney(load.priceEur)} /> : null}
          <Row label="Pricing" value={load.priceNegotiable ? "Negotiable" : "Fixed"} />
          {load.notes ? <Row label="Notes" value={load.notes} /> : null}
        </dl>
      </div>

      {showSelect && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-ink">Candidates ({pending.length})</h2>
          {pending.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-muted">
              No interest yet. Share the load link or check back soon.
            </div>
          ) : (
            pending.map((app) => (
              <CandidateRow key={app.id} app={app} loadId={load.id} />
            ))
          )}
        </section>
      )}

      {progressStatus && chosen && (
        <section className="space-y-3 rounded-2xl border border-black/8 bg-white p-5">
          <h2 className="text-lg font-bold text-ink">Selected carrier</h2>
          <CarrierInfo app={chosen} revealContact />
          {chosen.status === "ACCEPTED" && (
            <p className="text-sm font-semibold text-emerald-700">Offer accepted by the carrier — you can confirm the booking.</p>
          )}
          {chosen.status === "SELECTED" && (
            <p className="text-sm font-semibold text-amber-700">Waiting for the carrier to accept this offer.</p>
          )}
          {chosen.status === "DECLINED" && (
            <p className="text-sm font-semibold text-red-700">The carrier declined the offer. The load is open for applications again.</p>
          )}
          {progressStatus && <ProgressFlow loadId={load.id} status={progressStatus} carrierConfirmed={carrierAccepted} />}
          {load.status === "SELECTED" && chosen.status !== "DECLINED" && <UndoSelection loadId={load.id} />}
        </section>
      )}

      {load.status === "COMPLETED" && (
        <div className="rounded-2xl border border-black/8 bg-white p-5 text-center text-sm text-muted">
          This load is completed. Nice work.
        </div>
      )}

      {rejected.length > 0 && (
        <details className="rounded-2xl border border-black/8 bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold text-muted">
            Not selected ({rejected.length})
          </summary>
          <div className="mt-3 space-y-3">
            {rejected.map((app) => (
              <CarrierInfo key={app.id} app={app} compact />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function CandidateRow({ app, loadId }: { app: { id: string; transporter: { id: string; name: string; vehicleType: VehicleType | null; currentRegion: string | null; acceptsRegions: string | null; available: boolean } }; loadId: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/8 bg-white p-4">
      <CarrierInfo app={app} compact />
      <form action={selectTransporter}>
        <input type="hidden" name="loadId" value={loadId} />
        <input type="hidden" name="applicationId" value={app.id} />
        <button
          type="submit"
          className="flex-none rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Select
        </button>
      </form>
    </div>
  );
}

function CarrierInfo({
  app,
  compact,
  revealContact,
}: {
  app: { transporter: { name: string; vehicleType: VehicleType | null; currentRegion: string | null; acceptsRegions: string | null; available: boolean; phone?: string | null; email?: string | null }; createdAt?: Date };
  compact?: boolean;
  revealContact?: boolean;
}) {
  const regions = regionsFor(app.transporter.acceptsRegions);
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <p className="truncate font-semibold text-ink">{app.transporter.name}</p>
        {app.transporter.available && <Badge tone="green">Available</Badge>}
      </div>
      {!compact && app.createdAt && (
        <p className="mt-1 text-sm text-muted">Applied {app.createdAt.toLocaleDateString("en-GB")}</p>
      )}
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {app.transporter.vehicleType && <Badge>{VEHICLE_LABELS[app.transporter.vehicleType]}</Badge>}
        {app.transporter.currentRegion && <Badge>Based in {app.transporter.currentRegion}</Badge>}
        {regions.length > 0 && <Badge tone="brand">Serves {regions.join(", ")}</Badge>}
      </div>
      {revealContact && (
        <div className="mt-3 rounded-xl bg-brand-light/60 p-3 text-sm">
          <p className="font-semibold text-brand-dark">Contact details</p>
          {app.transporter.phone && <p className="mt-1 text-ink">Phone: {app.transporter.phone}</p>}
          {app.transporter.email && <p className="text-ink">Email: {app.transporter.email}</p>}
          <p className="mt-1 text-xs text-muted">They&apos;re expecting to hear from you about this load.</p>
        </div>
      )}
    </div>
  );
}

function ProgressFlow({ loadId, status, carrierConfirmed }: { loadId: string; status: "SELECTED" | "CONFIRMED" | "IN_TRANSIT"; carrierConfirmed: boolean }) {
  const next: Record<string, { status: "CONFIRMED" | "IN_TRANSIT" | "COMPLETED"; label: string }> = {
    SELECTED: { status: "CONFIRMED", label: "Confirm booking" },
    CONFIRMED: { status: "IN_TRANSIT", label: "Mark in transit" },
    IN_TRANSIT: { status: "COMPLETED", label: "Mark completed" },
  };
  const step = next[status];
  if (!step) return null;

  // Confirming a booking requires the carrier to have accepted the offer.
  if (step.status === "CONFIRMED" && !carrierConfirmed) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-xl bg-brand/40 py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        Waiting for carrier to accept
      </button>
    );
  }

  return (
    <form action={updateLoadStatus}>
      <input type="hidden" name="loadId" value={loadId} />
      <input type="hidden" name="status" value={step.status} />
      <button
        type="submit"
        className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white hover:bg-brand-dark"
      >
        {step.label} ({LOAD_STATUS_LABELS[step.status]})
      </button>
    </form>
  );
}

function UndoSelection({ loadId }: { loadId: string }) {
  return (
    <form action={undoSelection}>
      <input type="hidden" name="loadId" value={loadId} />
      <button
        type="submit"
        className="w-full rounded-xl border border-black/10 bg-white py-2.5 text-sm font-semibold text-muted hover:border-red-400 hover:text-red-600"
      >
        Undo selection
      </button>
    </form>
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
