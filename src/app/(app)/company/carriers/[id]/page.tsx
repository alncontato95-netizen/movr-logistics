import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompany } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getCarrierSummary } from "@/lib/carrier-stats";
import { regionsFor } from "@/lib/matching";
import { VEHICLE_LABELS, type VehicleType } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui";
import { getDictionary, getLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function CarrierHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }] = await Promise.all([params]);
  const user = await requireCompany();
  const locale = await getLocale();
  const t = getDictionary(locale);

  const company = await prisma.company.findUnique({ where: { userId: user.id } });
  if (!company) notFound();

  const carrier = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      name: true,
      email: true,
      phone: true,
      vehicleType: true,
      currentRegion: true,
      acceptsRegions: true,
      carrierVerified: true,
      createdAt: true,
    },
  });
  if (!carrier || carrier.role !== "CARRIER") notFound();

  const [summary, workedWith] = await Promise.all([
    getCarrierSummary(carrier.id),
    // Contact can only be revealed once selection reaches SELECTED or later for one of your loads.
    prisma.application.findFirst({
      where: { transporterId: carrier.id, status: { in: ["SELECTED", "ACCEPTED", "DECLINED"] }, load: { companyId: company.id } },
      include: { load: { select: { origin: true, destination: true } } },
    }),
  ]);

  const regions = regionsFor(carrier.acceptsRegions);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/company/loads" className="text-sm font-medium text-muted hover:text-ink">
        ← Voltar para suas cargas
      </Link>

      <section className="rounded-2xl border border-black/8 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-brand-light text-xl font-extrabold text-brand-dark">
            {carrier.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-extrabold text-ink">{carrier.name}</h1>
              {carrier.carrierVerified ? <Badge tone="green">Habilitação verificada</Badge> : <Badge tone="neutral">Sem habilitação</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted">
              Transportador na MOVR desde {formatDateTime(carrier.createdAt, locale)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {carrier.vehicleType && <Badge>{VEHICLE_LABELS[carrier.vehicleType as VehicleType]}</Badge>}
              {carrier.currentRegion && <Badge>Baseado em {carrier.currentRegion}</Badge>}
              {regions.length > 0 && <Badge tone="brand">Atende {regions.join(", ")}</Badge>}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-black/8 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink">{t.history.carrierHistory}</h2>
            <p className="mt-1 text-sm text-muted">{t.history.carrierHistorySub}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t.history.relevance}</p>
            <p className={`text-3xl font-extrabold ${summary.relevance >= 70 ? "text-brand-dark" : summary.relevance >= 40 ? "text-warning" : "text-error"}`}>
              {summary.relevance}
              <span className="text-base text-muted">/100</span>
            </p>
          </div>
        </div>

        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-black/8">
          <div
            className={`h-full rounded-full ${summary.relevance >= 70 ? "bg-brand" : summary.relevance >= 40 ? "bg-warning" : "bg-error"}`}
            style={{ width: `${Math.max(4, summary.relevance)}%` }}
          />
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-brand-light/50 p-3">
            <dt className="text-xs font-medium text-muted">{t.history.avgRating}</dt>
            <dd className="mt-1 text-lg font-extrabold text-ink">{summary.ratingCount ? `★ ${summary.avgRating.toFixed(1)}` : "—"}</dd>
            <dd className="text-xs text-muted">{summary.ratingCount} {t.history.ratings}</dd>
          </div>
          <div className="rounded-xl bg-brand-light/50 p-3">
            <dt className="text-xs font-medium text-muted">{t.history.completedLoads}</dt>
            <dd className="mt-1 text-lg font-extrabold text-ink">{summary.completedLoads}</dd>
          </div>
          <div className="rounded-xl bg-brand-light/50 p-3">
            <dt className="text-xs font-medium text-muted">{t.history.relevance}</dt>
            <dd className="mt-1 text-lg font-extrabold text-ink">{summary.relevance}/100</dd>
          </div>
        </dl>

        {workedWith ? (
          <div className="mt-5 rounded-xl bg-brand-light/60 p-3 text-sm">
            <p className="font-semibold text-brand-dark">Dados de contato</p>
            {carrier.phone && <p className="mt-1 break-words text-ink">Telefone: {carrier.phone}</p>}
            <p className="break-all text-ink">E-mail: {carrier.email}</p>
            <p className="mt-1 text-xs text-muted">
              Vocês trabalharam juntos em {workedWith.load.origin} → {workedWith.load.destination}.
            </p>
          </div>
        ) : (
          <p className="mt-5 rounded-xl bg-black/[0.04] p-3 text-xs text-muted">
            Os dados de contato são exibidos após você selecionar este transportador para uma carga.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-black/8 bg-white p-6">
        <h2 className="text-lg font-bold text-ink">{t.history.title}</h2>
        {summary.history.length === 0 ? (
          <p className="mt-3 rounded-xl bg-black/[0.04] p-4 text-sm text-muted">{t.history.noRatingsYet}</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {summary.history.map((entry) => (
              <li key={entry.loadId} className="rounded-xl border border-black/8 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">
                      {entry.origin} <span className="text-brand-dark">→</span> {entry.destination}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {t.history.delivered} {formatDateTime(entry.completedAt, locale)}
                    </p>
                    {entry.companyName && (
                      <p className="mt-1 text-xs text-muted">
                        {t.history.company}: {entry.companyName} {entry.companyVerified ? "✓" : ""}
                      </p>
                    )}
                    {entry.comment && <p className="mt-2 text-sm text-ink">“{entry.comment}”</p>}
                  </div>
                  <div className="flex-none text-right">
                    <p className={`text-lg font-extrabold ${entry.score >= 4 ? "text-brand-dark" : entry.score === 3 ? "text-warning" : "text-error"}`}>
                      ★ {entry.score}
                    </p>
                    <p className="text-xs text-muted">/5</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}