import "server-only";

import { prisma } from "@/lib/prisma";
import { getDictionary, getLocale, Locale } from "@/lib/i18n";
import { Role } from "@/generated/prisma/client";
import { updateLoadStatus } from "@/app/actions/loads";
import { acceptOffer } from "@/app/actions/loads";
import { declineOffer } from "@/app/actions/loads";
import { confirmPickup } from "@/app/actions/loads";
import { confirmDelivery } from "@/app/actions/loads";
import { canConfirmPickup, pickupReadyAt } from "@/lib/schedule";
import { formatDayTime } from "@/lib/format";

const MAX_ITEMS = 5;

export async function ActionCenter({ user: _user }: { user: { id: string; role: Role } }) {
  "use server";

  const locale: Locale = await getLocale();
  const t = getDictionary(locale);

  if (!_user) return null;

  const role = _user.role;

  if (role === "COMPANY") {
    return renderCompanyActions(locale, t, _user);
  }

  if (role === "CARRIER") {
    return renderCarrierActions(locale, t, _user);
  }

  return null;
}

async function renderCompanyActions(locale: Locale, t: ReturnType<typeof getDictionary>, user: { id: string; role: Role }) {
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

  const bookingItems = selectedWithAccepted.filter((load) => load.applications.length > 0).slice(0, MAX_ITEMS);
  const completedItems = deliveredItems.slice(0, MAX_ITEMS);
  const total = bookingItems.length + completedItems.length;

  // Funnel: hidden entirely when there is nothing to act on.
  if (total === 0) return null;

  return (
    <details
      className="group overflow-hidden rounded-2xl border border-brand/20 bg-brand/5"
      aria-label={t.actionCenter.title}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2.5 py-2.5 pl-4 pr-3 select-none [&::-webkit-details-marker]:hidden">
        <span className="relative flex h-2.5 w-2.5 flex-none">
          {total > 0 && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/60" />
          )}
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand" />
        </span>
        <span className="text-sm font-semibold text-ink">{t.actionCenter.title}</span>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-brand ring-1 ring-brand/20">
          {total}
        </span>
        <svg
          className="ml-auto h-4 w-4 flex-none text-muted transition-transform group-open:rotate-180"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>

      <div className="space-y-2 px-4 pb-4">
        {bookingItems.map((load) => (
          <div
            key={load.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-brand/15 bg-white px-3 py-2"
          >
            <p className="min-w-0 truncate text-sm font-semibold text-ink">
              {load.origin} <span className="text-brand-dark">→</span> {load.destination}
            </p>
            <form action={updateLoadStatus} className="flex-none">
              <input type="hidden" name="loadId" value={load.id} />
              <input type="hidden" name="status" value="CONFIRMED" />
              <button
                type="submit"
                className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-dark"
              >
                {t.actionCenter.confirmBooking}
              </button>
            </form>
          </div>
        ))}

        {completedItems.map((load) => (
          <div
            key={load.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-success/20 bg-white px-3 py-2"
          >
            <p className="min-w-0 truncate text-sm font-semibold text-ink">
              {load.origin} <span className="text-success-600">→</span> {load.destination}
            </p>
            <form action={updateLoadStatus} className="flex-none">
              <input type="hidden" name="loadId" value={load.id} />
              <input type="hidden" name="status" value="COMPLETED" />
              <button
                type="submit"
                className="rounded-lg bg-success px-3 py-1.5 text-xs font-bold text-white hover:bg-success-dark"
              >
                {t.actionCenter.markCompleted}
              </button>
            </form>
          </div>
        ))}
      </div>
    </details>
  );
}

async function renderCarrierActions(locale: Locale, t: ReturnType<typeof getDictionary>, user: { id: string; role: Role }) {
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
    <div className="glass-card border border-info/15 p-6">
      <h3 className="mb-3 text-sm font-semibold text-info-600">{t.actionCenter.title}</h3>

      {/* Select action items - pending selections */}
      {selectedApps.length > 0 && (
        <div className="space-y-3">
          {selectedApps.map((app) => (
            <div key={app.id} className="space-y-3 rounded-lg border border-warning-200 bg-warning-50 p-4">
              <p className="font-medium text-warning-700">
                {t.actionCenter.transporterSelected
                  ? `${t.actionCenter.transporterSelected} ${app.load.origin} → ${app.load.destination}`
                  : `Ação necessária — Você foi selecionado para ${app.load.origin} → ${app.load.destination}`}
              </p>
              <div className="flex gap-2">
                <form action={acceptOffer}>
                  <input type="hidden" name="loadId" value={app.loadId} />
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-dark">
                    {t.actionCenter.accept}
                  </button>
                </form>
                <form action={declineOffer}>
                  <input type="hidden" name="loadId" value={app.loadId} />
                  <button
                    type="submit"
                    className="flex-1 rounded-xl border border-black/10 bg-white py-2 text-sm font-semibold text-muted hover:border-error-400 hover:text-error-600">
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
            <div key={app.id} className="space-y-3 rounded-lg border border-info-200 bg-info-50 p-4">
              <p className="font-medium text-info-700">
                {t.actionCenter.confirmPickup
                  ? `${t.actionCenter.confirmPickup} ${app.load.origin} → ${app.load.destination}`
                  : `Ação necessária — Confirme a coleta para ${app.load.origin} → ${app.load.destination}`}
              </p>
              {canConfirmPickup(app.load.pickupDate, app.load.pickupWindow) ? (
                <form action={confirmPickup}>
                  <input type="hidden" name="loadId" value={app.load.id} />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-info py-2.5 text-sm font-bold text-white hover:bg-info-700">
                      {t.actionCenter.confirmPickup}
                  </button>
                </form>
              ) : (
                <p className="rounded-xl bg-white/70 px-3 py-2 text-center text-xs font-semibold text-info-700">
                  {t.journey.pickupOpensAt}{" "}
                  {formatDayTime(pickupReadyAt(app.load.pickupDate, app.load.pickupWindow), locale)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirm delivery items */}
      {pickedUpLoads.length > 0 && (
        <div className="space-y-3 mt-4">
          {pickedUpLoads.map((app) => (
            <div key={app.id} className="space-y-3 rounded-lg border border-success-200 bg-success-light p-4">
              <p className="font-medium text-success-600">
                {t.actionCenter.confirmDelivery
                  ? `${t.actionCenter.confirmDelivery} ${app.load.origin} → ${app.load.destination}`
                  : `Ação necessária — Confirme a entrega para ${app.load.origin} → ${app.load.destination}`}
              </p>
              <form action={confirmDelivery}>
                <input type="hidden" name="loadId" value={app.load.id} />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-success py-2.5 text-sm font-bold text-white hover:bg-success-dark">
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
    </div>
  );
}