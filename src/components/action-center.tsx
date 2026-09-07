import "server-only";

import { prisma } from "@/lib/prisma";
import { getDictionary, getLocale, Locale } from "@/lib/i18n";
import { Card } from "@/components/ui";
import { updateLoadStatus } from "@/app/actions/loads";
import { acceptOffer } from "@/app/actions/loads";
import { declineOffer } from "@/app/actions/loads";
import { confirmPickup } from "@/app/actions/loads";
import { confirmDelivery } from "@/app/actions/loads";

const MAX_ITEMS = 5;

export async function ActionCenter() {
  "use server";

  const user = await (await import("@/lib/dal")).getCurrentUser();
  const locale: Locale = await getLocale();
  const t = getDictionary(locale);

  if (!user) return null;

  const role = user.role;

  if (role === "COMPANY") {
    return renderCompanyActions(locale, t, user);
  }

  if (role === "CARRIER") {
    return renderCarrierActions(locale, t, user);
  }

  return null;
}

async function renderCompanyActions(locale: Locale, t: ReturnType<typeof getDictionary>, user) {
  "use server";

  const company = await prisma.company.findUnique({ where: { userId: user.id } });
  if (!company) return null;

  // 1. Loads with Application ACCEPTED + Load SELECTED → "Confirm booking"
  const selectedWithAccepted = await prisma.load.findMany({
    where: {
      companyId: company.id,
      status: "SELECTED",
    },
    include: {
      applications: {
        where: { status: "ACCEPTED" },
        take: 1,
      },
    },
    take: MAX_ITEMS,
    orderBy: { updatedAt: "desc" },
  });

  // 2. Loads with status DELIVERED → "Mark as completed"
  const deliveredItems = await prisma.load.findMany({
    where: {
      companyId: company.id,
      status: "DELIVERED",
    },
    take: MAX_ITEMS,
    orderBy: { updatedAt: "desc" },
  });

  return (
    <Card className="p-6">
      <h3 className="mb-3 text-sm font-semibold text-ink">{t.actionCenter.title}</h3>

      {/* Confirm booking items */}
      {selectedWithAccepted.length > 0 && (
        <div className="space-y-3">
          {selectedWithAccepted
            .filter((load) => load.applications.length > 0)
            .slice(0, MAX_ITEMS)
            .map((load) => (
              <div key={load.id} className="space-y-3 p-4 border rounded-lg border-brand/20 bg-brand/5">
                <p className="font-medium text-ink">
                  {t.actionCenter.bookingRequest
                    ? `${t.actionCenter.bookingRequest} ${load.origin} → ${load.destination}`
                    : `Action required — Carrier accepted the offer for ${load.origin} → ${load.destination}`}
                </p>
                <form action={updateLoadStatus}>
                  <input type="hidden" name="loadId" value={load.id} />
                  <input type="hidden" name="status" value="CONFIRMED" />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-brand py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
                  >
                    {t.actionCenter.confirmBooking}
                  </button>
                </form>
              </div>
            ))}
        </div>
      )}

      {/* Mark completed items */}
      {deliveredItems.length > 0 && (
        <div className="space-y-3 mt-4">
          {deliveredItems.slice(0, MAX_ITEMS).map((load) => (
            <div key={load.id} className="space-y-3 p-4 border rounded-lg border-emerald/20 bg-emerald/5">
              <p className="font-medium text-ink">
                {t.actionCenter.markCompleted
                  ? `${t.actionCenter.markCompleted} ${load.origin} → ${load.destination}`
                  : `Action required — Mark ${load.origin} → ${load.destination} as completed`}
              </p>
              <form action={updateLoadStatus}>
                <input type="hidden" name="loadId" value={load.id} />
                <input type="hidden" name="status" value="COMPLETED" />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald py-2.5 text-sm font-bold text-white hover:bg-emerald-dark"
                >
                  {t.actionCenter.markCompleted}
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
{selectedWithAccepted.length === 0 && deliveredItems.length === 0 && (
        <p className="text-lg text-muted mt-4">{t.actionCenter.empty}</p>
      )}
    </Card>
  );
}

async function renderCarrierActions(locale: Locale, t: ReturnType<typeof getDictionary>, user) {
  "use server";

  // 1. Applications with status SELECTED → "You were selected for {origin} → {destination}" with [Accept] and [Decline]
  const selectedApps = await prisma.application.findMany({
    where: { transporterId: user.id, status: "SELECTED" },
    include: { load: true },
    take: MAX_ITEMS,
    orderBy: { updatedAt: "desc" },
  });

  // 2. Loads with Application ACCEPTED + Load CONFIRMED → "Confirm pickup"
  const confirmedLoads = await prisma.application.findMany({
    where: {
      transporterId: user.id,
      status: "ACCEPTED",
      load: { status: "CONFIRMED" },
    },
    include: { load: true },
    take: MAX_ITEMS,
    orderBy: { updatedAt: "desc" },
  });

  // 3. Loads with Application ACCEPTED + Load PICKED_UP → "Confirm delivery"
  const pickedUpLoads = await prisma.application.findMany({
    where: {
      transporterId: user.id,
      status: "ACCEPTED",
      load: { status: "PICKED_UP" },
    },
    include: { load: true },
    take: MAX_ITEMS,
    orderBy: { updatedAt: "desc" },
  });

  return (
    <Card className="p-6">
      <h3 className="mb-3 text-sm font-semibold text-ink">{t.actionCenter.title}</h3>

      {/* Select action items - pending selections */}
      {selectedApps.length > 0 && (
        <div className="space-y-3">
          {selectedApps.map((app) => (
            <div key={app.id} className="space-y-3 p-4 border rounded-lg border-amber/20 bg-amber/5">
              <p className="font-medium text-ink">
                {t.actionCenter.transporterSelected
                  ? `${t.actionCenter.transporterSelected} ${app.load.origin} → ${app.load.destination}`
                  : `Action required — You were selected for ${app.load.origin} → ${app.load.destination}`}
              </p>
              <div className="flex gap-2">
                <form action={acceptOffer}>
                  <input type="hidden" name="loadId" value={app.loadId} />
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                  >
                    {t.actionCenter.accept}
                  </button>
                </form>
                <form action={declineOffer}>
                  <input type="hidden" name="loadId" value={app.loadId} />
                  <button
                    type="submit"
                    className="flex-1 rounded-xl border border-black/10 bg-white py-2 text-sm font-semibold text-muted hover:border-red-400 hover:text-red-600"
                  >
                    {t.actionCenter.decline}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm pickup items */}
      {confirmedLoads.length > 0 && (
        <div className="space-y-3 mt-4">
          {confirmedLoads.map((app) => (
            <div key={app.id} className="space-y-3 p-4 border rounded-lg border-blue/20 bg-blue/5">
              <p className="font-medium text-ink">
                {t.actionCenter.confirmPickup
                  ? `${t.actionCenter.confirmPickup} ${app.load.origin} → ${app.load.destination}`
                  : `Action required — Confirm pickup for ${app.load.origin} → ${app.load.destination}`}
              </p>
              <form action={confirmPickup}>
                <input type="hidden" name="loadId" value={app.load.id} />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue py-2.5 text-sm font-bold text-white hover:bg-blue-dark"
                >
                  {t.actionCenter.confirmPickup}
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {/* Confirm delivery items */}
      {pickedUpLoads.length > 0 && (
        <div className="space-y-3 mt-4">
          {pickedUpLoads.map((app) => (
            <div key={app.id} className="space-y-3 p-4 border rounded-lg border-green/20 bg-green/5">
              <p className="font-medium text-ink">
                {t.actionCenter.confirmDelivery
                  ? `${t.actionCenter.confirmDelivery} ${app.load.origin} → ${app.load.destination}`
                  : `Action required — Confirm delivery for ${app.load.origin} → ${app.load.destination}`}
              </p>
              <form action={confirmDelivery}>
                <input type="hidden" name="loadId" value={app.load.id} />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-green py-2.5 text-sm font-bold text-white hover:bg-green-dark"
                >
                  {t.actionCenter.confirmDelivery}
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {selectedApps.length === 0 && confirmedLoads.length === 0 && pickedUpLoads.length === 0 && (
        <p className="text-lg text-muted mt-4">{t.actionCenter.empty}</p>
      )}
    </Card>
  );
}