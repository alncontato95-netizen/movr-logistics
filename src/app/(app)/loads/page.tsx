import { requireCarrier } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { filterCompatible, regionsFor } from "@/lib/matching";
import { LoadCard } from "@/components/load-card";
import { ButtonLink } from "@/components/ui";

export default async function LoadsPage() {
  const user = await requireCarrier();
  const incomplete = !user.vehicleType || !user.currentRegion;

  const allLoads = await prisma.load.findMany({
    where: { status: "OPEN" },
    orderBy: { pickupDate: "asc" },
  });

  const compatible = filterCompatible(user, allLoads);
  const serves = regionsFor(user.acceptsRegions);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Loads for you</h1>
          <p className="mt-1 text-sm text-muted">
            {compatible.length} compatible {compatible.length === 1 ? "load" : "loads"} right now.
          </p>
        </div>
        <ButtonLink href="/profile" variant="secondary">
          Edit profile
        </ButtonLink>
      </div>

      {incomplete && (
        <div className="rounded-2xl border border-brand/30 bg-brand-light p-4 text-sm text-brand-dark">
          <p className="font-semibold">Finish your profile to see matching loads.</p>
          <p className="mt-1">Add your vehicle type and home region to get started.</p>
          <div className="mt-3">
            <ButtonLink href="/profile">Complete profile</ButtonLink>
          </div>
        </div>
      )}

      {!user.available && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">You&apos;re currently marked unavailable.</p>
          <p className="mt-1">Enable &quot;Available for loads now&quot; on your profile to be matched with new loads.</p>
          <div className="mt-3">
            <ButtonLink href="/profile" variant="secondary">Mark available</ButtonLink>
          </div>
        </div>
      )}

      {serves.length === 0 && (
        <div className="rounded-2xl border border-black/8 bg-white p-4 text-sm text-muted">
          Pick the regions you serve on your profile so we can show you loads that fit your routes.
        </div>
      )}

      {compatible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 p-10 text-center text-sm text-muted">
          No compatible loads right now. Check back soon or widen the regions you serve.
        </div>
      ) : (
        <div className="grid gap-3">
          {compatible.map((load) => (
            <LoadCard key={load.id} load={load} href={`/loads/${load.id}`} matchLabel="Compatible with you" />
          ))}
        </div>
      )}
    </div>
  );
}
