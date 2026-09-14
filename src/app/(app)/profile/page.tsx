import { requireCarrier } from "@/lib/dal";
import { regionsFor } from "@/lib/matching";
import { getCarrierSummary } from "@/lib/carrier-stats";
import { CarrierProfileForm } from "@/components/CarrierProfileForm";
import { Card } from "@/components/ui";
import { VEHICLE_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function ProfilePage() {
  const user = await requireCarrier();
  const locale = await getLocale();
  const t = getDictionary(locale);
  const summary = await getCarrierSummary(user.id);
  const acceptsRegions = regionsFor(user.acceptsRegions);
  const incomplete = !user.vehicleType || !user.currentRegion;
  const licenseExpiryStr = user.licenseExpiry ? new Date(user.licenseExpiry).toISOString().slice(0, 10) : null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Your profile</h1>
        <p className="mt-1 text-sm text-muted">
          Hi {user.name.split(" ")[0]} — tell us about your truck so we can match you with the right loads.
        </p>
      </div>

      {incomplete && (
        <div className="rounded-2xl bg-brand-light p-4 text-sm text-brand-dark">
          Complete your profile to start seeing compatible loads.
        </div>
      )}

      {!user.licenseUrl && (
        <div className="rounded-2xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800">
          Add your habilitação (C/E + Code 95) to earn the verified badge for high-value loads — optional now, soft trust signal.
        </div>
      )}

      <Card>
        <h2 className="text-lg font-bold text-ink">{t.history.yourReputation}</h2>
        <p className="mt-1 text-sm text-muted">{t.history.yourReputationSub}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div
            className={`inline-flex h-12 min-w-12 items-center justify-center rounded-full px-3 text-lg font-extrabold text-white ${
              summary.relevance >= 70 ? "bg-brand" : summary.relevance >= 40 ? "bg-warning" : "bg-error"
            }`}
          >
            {summary.relevance}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t.history.relevance}</p>
            <p className="text-sm text-ink">
              ★ {summary.avgRating ? summary.avgRating.toFixed(1) : "—"}{" "}
              <span className="text-muted">
                ({summary.ratingCount} {t.history.ratings}) · {summary.completedLoads} {t.history.completedLoads}
              </span>
            </p>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/8">
              <div
                className={`h-full rounded-full ${summary.relevance >= 70 ? "bg-brand" : summary.relevance >= 40 ? "bg-warning" : "bg-error"}`}
                style={{ width: `${Math.max(4, summary.relevance)}%` }}
              />
            </div>
          </div>
        </div>

        {summary.history.length > 0 ? (
          <ol className="mt-4 space-y-2">
            {summary.history.slice(0, 5).map((entry) => (
              <li key={entry.loadId} className="flex items-center justify-between gap-3 rounded-lg bg-black/[0.04] px-3 py-2">
                <span className="min-w-0 text-sm text-ink">
                  {entry.origin} → {entry.destination}
                  <span className="block text-xs text-muted">{formatDateTime(entry.completedAt, locale)}</span>
                </span>
                <span
                  className={`flex-none text-sm font-extrabold ${entry.score >= 4 ? "text-brand-dark" : entry.score === 3 ? "text-warning" : "text-error"}`}
                >
                  ★ {entry.score}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-sm text-muted">{t.history.empty}</p>
        )}
      </Card>

      <Card>
        <CarrierProfileForm
          initial={{
            vehicleType: user.vehicleType,
            vehiclePlate: user.vehiclePlate,
            professionalLicense: user.professionalLicense,
            licenseUrl: user.licenseUrl,
            licenseExpiry: licenseExpiryStr,
            carrierVerified: user.carrierVerified,
            rntrc: user.rntrc,
            phone: user.phone,
            currentRegion: user.currentRegion,
            acceptsRegions,
            available: user.available,
          }}
          rntrcLabel={t.profile.rntrcLabel}
          rntrcDescription={t.profile.rntrcDescription}
          rntrcPlaceholder={t.profile.rntrcPlaceholder}
        />
      </Card>

      <Card className="bg-transparent shadow-none border-0 space-y-1.5">
        <p className="text-sm text-muted">
          {user.vehicleType ? (
            <>Vehicle: <span className="font-semibold text-ink">{VEHICLE_LABELS[user.vehicleType]}</span></>
          ) : (
            "No vehicle selected yet."
          )}
        </p>
        {user.vehiclePlate && (
          <p className="text-sm text-muted">
            Plate: <span className="font-semibold text-ink">{user.vehiclePlate}</span>
          </p>
        )}
        {user.phone && (
          <p className="text-sm text-muted">
            Phone: <span className="font-semibold text-ink">{user.phone}</span>
          </p>
        )}
      </Card>
    </div>
  );
}
