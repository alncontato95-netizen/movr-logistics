import Link from "next/link";
import type { Load } from "@/generated/prisma/client";
import { Badge, LoadStatusBadge } from "@/components/ui";
import { CARGO_LABELS, VEHICLE_LABELS } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/format";

export function LoadCard({
  load,
  href,
  matchLabel,
}: {
  load: Load;
  href: string;
  matchLabel?: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-[var(--radius-card)] border border-white/60 bg-white/75 p-5 shadow-[var(--shadow-float)] backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-brand/20 hover:bg-white/90 hover:shadow-[0_16px_40px_rgba(5,5,7,0.10),0_4px_16px_rgba(58,175,66,0.10)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-ink">
              {load.origin} <span className="text-brand" aria-hidden>→</span> {load.destination}
            </p>
          </div>
          <p className="mt-0.5 text-sm text-muted">{formatDate(load.pickupDate)}</p>
        </div>
        <LoadStatusBadge status={load.status} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge>{CARGO_LABELS[load.cargoType]}</Badge>
        <Badge>{load.weightKg} kg</Badge>
        {load.requiredVehicle && <Badge>{VEHICLE_LABELS[load.requiredVehicle]}</Badge>}
        {load.priceEur ? <Badge tone="green">{formatMoney(load.priceEur)}</Badge> : <Badge>Price negotiable</Badge>}
      </div>

      {matchLabel && (
        <p className="mt-3 inline-flex items-center gap-1 rounded-lg bg-brand-light px-2 py-1 text-xs font-semibold text-brand-dark">
          {matchLabel}
        </p>
      )}
    </Link>
  );
}
