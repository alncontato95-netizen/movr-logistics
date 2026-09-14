import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCompany } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { regionsFor } from "@/lib/matching";
import { getCarrierOverviews, type CarrierOverview } from "@/lib/carrier-stats";
import { cancelLoad, duplicateLoad, selectTransporter, undoSelection, updateLoadStatus } from "@/app/actions/loads";
import { PollRefresh } from "@/components/poll-refresh";
import { LoadLifecycle } from "@/components/load-lifecycle";
import { Badge, LoadStatusBadge } from "@/components/ui";
import { CARGO_LABELS, VEHICLE_LABELS, LOAD_STATUS_LABELS, type VehicleType } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/format";
import { RatingForm } from "@/components/rating-form";
import { RouteMap } from "@/components/route-map-wrapper";
import { getDictionary, getLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function CompanyLoadDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ selected?: string; undone?: string; "awaiting-acceptance"?: string; cancelled?: string; updated?: string; duplicated?: string; rated?: string; "pod-required"?: string }> }) {
  const [{ id }, { selected, undone, "awaiting-acceptance": awaitingAcceptance, cancelled, updated, duplicated, rated, "pod-required": podRequired }] = await Promise.all([params, searchParams]);
  const user = await requireCompany();
  const locale = await getLocale();
  const t = getDictionary(locale);
  const company = await prisma.company.findUnique({ where: { userId: user.id } });

  const load = await prisma.load.findUnique({
    where: { id },
    include: { applications: { include: { transporter: true }, orderBy: { createdAt: "asc" } }, rating: true },
  });
  if (!load || !company || load.companyId !== company.id) notFound();

  const pending = load.applications.filter((a) => a.status === "PENDING");
  const chosen = load.applications.find((a) => a.status === "SELECTED" || a.status === "ACCEPTED" || a.status === "DECLINED");
  const rejected = load.applications.filter((a) => a.status === "REJECTED");

  const rating = load.rating;
  const carrierAvg = chosen
    ? await prisma.rating.aggregate({ where: { carrierId: chosen.transporter.id }, _avg: { score: true }, _count: { _all: true } })
    : null;

  const candidateIds = pending.map((a) => a.transporter.id);
  const overviewsByCarrier = await getCarrierOverviews(candidateIds);

  const showSelect = load.status === "OPEN";
  const carrierAccepted = chosen?.status === "ACCEPTED";
  const progressStatus =
    load.status === "SELECTED" || load.status === "CONFIRMED" || load.status === "PICKED_UP" || load.status === "DELIVERED" ? load.status : null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PollRefresh intervalMs={10000} />
      <Link href="/company/loads" className="text-sm font-medium text-muted hover:text-ink">
        ← Voltar para suas cargas
      </Link>

      {selected && chosen && (
        <div className="rounded-2xl bg-brand-light p-4 text-sm font-semibold text-brand-dark">
          {chosen.transporter.name.split(" ")[0]} selecionado. A carga ficou reservada para ele — aguardando a aceitação.
        </div>
      )}

      {undone && (
        <div className="rounded-2xl bg-brand-light p-4 text-sm font-semibold text-brand-dark">
          Seleção desfeita. A carga está aberta para candidaturas novamente.
        </div>
      )}

      {awaitingAcceptance && (
        <div className="rounded-2xl bg-warning-50 p-4 text-sm font-semibold text-warning-800">
          A reserva ainda não pode ser confirmada — o transportador selecionado precisa aceitar a proposta primeiro.
        </div>
      )}

      {cancelled && (
        <div className="rounded-2xl bg-neutral-100 p-4 text-sm font-semibold text-ink">
          Carga cancelada.
        </div>
      )}

      {updated && (
        <div className="rounded-2xl bg-brand-light p-4 text-sm font-semibold text-brand-dark">
          Carga atualizada.
        </div>
      )}

      {duplicated && (
        <div className="rounded-2xl bg-brand-light p-4 text-sm font-semibold text-brand-dark">
          Carga duplicada — novo rascunho criado.
        </div>
      )}

      {rated && (
        <div className="rounded-2xl bg-success-light p-4 text-sm font-semibold text-success-700">
          Avaliação salva. Obrigado!
        </div>
      )}

      {podRequired && (
        <div className="rounded-2xl bg-warning-50 p-4 text-sm font-semibold text-warning-800">
          POD obrigatória — o transportador precisa enviar o comprovante de entrega antes de concluir.
        </div>
      )}

      <div className="rounded-2xl border border-black/8 bg-white p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-ink">
            {load.origin} <span className="text-brand-dark">→</span> {load.destination}
          </h1>
          <LoadStatusBadge status={load.status} locale={locale} />
        </div>
        <p className="mt-1 text-muted">Coleta {formatDate(load.pickupDate)}</p>

        <dl className="mt-6 space-y-3 text-sm">
          <Row label="Tipo de carga" value={CARGO_LABELS[load.cargoType]} />
          <Row label="Peso" value={`${load.weightKg} kg${load.volumeM3 ? ` · ${load.volumeM3} m³` : ""}`} />
          <Row label="Veículo necessário" value={load.requiredVehicle ? VEHICLE_LABELS[load.requiredVehicle] : "Qualquer"} />
          {load.priceEur ? <Row label="Preço ofertado" value={formatMoney(load.priceEur)} /> : null}
          <Row label="Preço" value={load.priceNegotiable ? "Negociável" : "Fixo"} />
          {load.notes ? <Row label="Observações" value={load.notes} /> : null}
        </dl>
      </div>

      <div className="space-y-1">
        <RouteMap origin={load.origin} destination={load.destination} />
        <p className="text-center text-xs text-muted">{t.loads.approximateRoute}</p>
      </div>

      <div className="flex gap-3">
        {load.status === "OPEN" && (
          <Link
            href={`/company/loads/${load.id}/edit`}
            className="flex-1 rounded-xl border border-black/10 bg-white py-2.5 text-center text-sm font-semibold text-ink hover:border-brand hover:bg-brand-light/40 hover:text-brand-dark"
          >
            Editar carga
          </Link>
        )}
        <div className="flex-1">
          <DuplicateLoad loadId={load.id} />
        </div>
        {(load.status === "OPEN" || load.status === "SELECTED") && (
          <div className="flex-1">
            <CancelLoad loadId={load.id} />
          </div>
        )}
      </div>

      {load.podUrl && (
        <div className="rounded-2xl border border-success-200 bg-success-light p-4">
          <p className="font-semibold text-success-700">Comprovante de entrega</p>
          <a href={load.podUrl} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-success-700 underline">
            {load.podUrl}
          </a>
          {load.podNote && <p className="mt-1 text-sm text-muted">{load.podNote}</p>}
        </div>
      )}

      {showSelect && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-ink">Candidatos ({pending.length})</h2>
          {pending.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-muted">
              Nenhum interesse ainda. Compartilhe o link da carga ou volte em breve.
            </div>
          ) : (
            pending.map((app) => {
              const stats = overviewsByCarrier.get(app.transporter.id);
              return (
                <CandidateRow
                  key={app.id}
                  app={app}
                  loadId={load.id}
                  stats={stats}
                  labels={{
                    relevance: t.history.relevance,
                    ratings: t.history.ratings,
                    completed: t.history.completedLoads,
                    viewHistory: t.history.viewHistory,
                  }}
                />
              );
            })
          )}
        </section>
      )}

      {progressStatus && chosen && (
        <section className="space-y-3 rounded-2xl border border-black/8 bg-white p-5">
          <h2 className="text-lg font-bold text-ink">Transportador selecionado</h2>
          <CarrierInfo app={chosen} revealContact />
          {chosen.status === "ACCEPTED" && (
            <p className="text-sm font-semibold text-success-700">Proposta aceita pelo transportador — você já pode confirmar a reserva.</p>
          )}
          {chosen.status === "SELECTED" && (
            <p className="text-sm font-semibold text-warning-700">Aguardando o transportador aceitar esta proposta.</p>
          )}
          {chosen.status === "DECLINED" && (
            <p className="text-sm font-semibold text-error-700">O transportador recusou a proposta. A carga está aberta para candidaturas novamente.</p>
          )}
          {load.status === "CONFIRMED" && (
            <p className="text-sm font-semibold text-info-700">Reserva confirmada — aguardando coleta do transportador.</p>
          )}
          {load.status === "PICKED_UP" && (
            <p className="text-sm font-semibold text-info-700">O transportador realizou a coleta — em trânsito.</p>
          )}
          {load.status === "DELIVERED" && (
            <p className="text-sm font-semibold text-success-700">Carga entregue — você já pode marcar esta reserva como concluída.</p>
          )}
          {progressStatus && <LoadLifecycle status={load.status} applied selected={!!chosen} locale={locale} />}
          {progressStatus && <ProgressFlow loadId={load.id} status={progressStatus} carrierConfirmed={carrierAccepted} />}
          {load.status === "SELECTED" && chosen.status !== "DECLINED" && <UndoSelection loadId={load.id} />}
        </section>
      )}

      {load.status === "COMPLETED" && (
        <section className="rounded-2xl border border-black/8 bg-white p-5">
          <div className="text-center text-sm text-muted">Esta carga está concluída. Bom trabalho.</div>
          {rating ? (
            <div className="mt-4 rounded-xl bg-brand-light/40 p-3 text-sm">
              <p className="font-semibold text-ink">Sua avaliação: ★ {rating.score}</p>
              {rating.comment && <p className="mt-1 text-muted">{rating.comment}</p>}
              {carrierAvg && carrierAvg._avg.score && (
                <p className="mt-1 text-xs text-muted">
                  Média do transportador ★ {Number(carrierAvg._avg.score).toFixed(1)} ({carrierAvg._count._all})
                </p>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <h3 className="font-semibold text-ink">Avaliar este transportador</h3>
              <p className="text-sm text-muted">Como foi a entrega?</p>
              <div className="mt-3">
                <RatingForm loadId={load.id} />
              </div>
              {carrierAvg && carrierAvg._avg.score && (
                <p className="mt-2 text-xs text-muted">
                  Média do transportador ★ {Number(carrierAvg._avg.score).toFixed(1)} ({carrierAvg._count._all} avaliações)
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {rejected.length > 0 && (
        <details className="rounded-2xl border border-black/8 bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold text-muted">
            Não selecionados ({rejected.length})
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

function CandidateRow({ app, loadId, stats, labels }: { app: { id: string; transporter: { id: string; name: string; vehicleType: VehicleType | null; currentRegion: string | null; acceptsRegions: string | null; available: boolean; carrierVerified?: boolean; licenseUrl?: string | null } }; loadId: string; stats?: CarrierOverview; labels: { relevance: string; ratings: string; completed: string; viewHistory: string } }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <CarrierInfo app={app} compact />
        </div>
        <form action={selectTransporter} className="flex-none">
          <input type="hidden" name="loadId" value={loadId} />
          <input type="hidden" name="applicationId" value={app.id} />
          <button
            type="submit"
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Selecionar
          </button>
        </form>
      </div>
      {stats && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-brand-light/50 px-3 py-2.5">
          <span className="inline-flex items-center gap-2">
            <span
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-extrabold text-white ${
                stats.relevance >= 70 ? "bg-brand" : stats.relevance >= 40 ? "bg-warning" : "bg-error"
              }`}
            >
              {stats.relevance}
            </span>
            <span className="text-xs font-semibold text-brand-dark">{labels.relevance}</span>
          </span>
          <span className="text-sm font-semibold text-ink">
            ★ {stats.avgRating ? stats.avgRating.toFixed(1) : "—"}
            <span className="ml-1 text-xs font-medium text-muted">
              ({stats.ratingCount} {labels.ratings})
            </span>
          </span>
          <span className="text-sm text-muted">
            {stats.completedLoads} {labels.completed}
          </span>
          <Link
            href={`/company/carriers/${app.transporter.id}`}
            className="ml-auto text-sm font-semibold text-brand-dark underline-offset-2 hover:underline"
          >
            {labels.viewHistory} →
          </Link>
        </div>
      )}
    </div>
  );
}

function CarrierInfo({
  app,
  compact,
  revealContact,
}: {
  app: { transporter: { name: string; vehicleType: VehicleType | null; currentRegion: string | null; acceptsRegions: string | null; available: boolean; carrierVerified?: boolean; licenseUrl?: string | null; phone?: string | null; email?: string | null }; createdAt?: Date };
  compact?: boolean;
  revealContact?: boolean;
}) {
  const regions = regionsFor(app.transporter.acceptsRegions);
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <p className="truncate font-semibold text-ink">{app.transporter.name}</p>
        {app.transporter.available && <Badge tone="green">Disponível</Badge>}
      </div>
      {!compact && app.createdAt && (
        <p className="mt-1 text-sm text-muted">Candidatou-se em {app.createdAt.toLocaleDateString("pt-BR")}</p>
      )}
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {app.transporter.vehicleType && <Badge>{VEHICLE_LABELS[app.transporter.vehicleType]}</Badge>}
        {app.transporter.currentRegion && <Badge>Baseado em {app.transporter.currentRegion}</Badge>}
        {regions.length > 0 && <Badge tone="brand">Atende {regions.join(", ")}</Badge>}
        {app.transporter.carrierVerified ? (
          <Badge tone="green">Habilitação verificada</Badge>
        ) : app.transporter.licenseUrl ? (
          <Badge tone="amber">Habilitação enviada</Badge>
        ) : (
          <Badge tone="neutral">Sem habilitação</Badge>
        )}
      </div>
      {revealContact && (
        <div className="mt-3 rounded-xl bg-brand-light/60 p-3 text-sm">
          <p className="font-semibold text-brand-dark">Dados de contato</p>
          {app.transporter.phone && <p className="mt-1 break-words text-ink">Telefone: {app.transporter.phone}</p>}
          {app.transporter.email && <p className="break-all text-ink">E-mail: {app.transporter.email}</p>}
          <p className="mt-1 text-xs text-muted">Eles aguardam seu contato sobre esta carga.</p>
        </div>
      )}
    </div>
  );
}

function ProgressFlow({ loadId, status, carrierConfirmed }: { loadId: string; status: "SELECTED" | "CONFIRMED" | "PICKED_UP" | "DELIVERED"; carrierConfirmed: boolean }) {
  const next: Record<string, { status: "CONFIRMED" | "COMPLETED"; label: string }> = {
    SELECTED: { status: "CONFIRMED", label: "Confirmar reserva" },
    DELIVERED: { status: "COMPLETED", label: "Marcar como concluída" },
  };
  const step = next[status];
  if (!step) return null;

  // Confirmar uma reserva exige que o transportador tenha aceitado a proposta.
  if (step.status === "CONFIRMED" && !carrierConfirmed) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-xl bg-brand/40 py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        Aguardando o transportador aceitar
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
        className="w-full rounded-xl border border-black/10 bg-white py-2.5 text-sm font-semibold text-muted hover:border-error-400 hover:text-error-600"
      >
        Desfazer seleção
      </button>
    </form>
  );
}

function CancelLoad({ loadId }: { loadId: string }) {
  return (
    <form action={cancelLoad}>
      <input type="hidden" name="loadId" value={loadId} />
      <button
        type="submit"
        className="w-full rounded-xl border border-black/10 bg-white py-2.5 text-sm font-semibold text-muted hover:border-error-400 hover:text-error-600"
      >
        Cancelar carga
      </button>
    </form>
  );
}

function DuplicateLoad({ loadId }: { loadId: string }) {
  return (
    <form action={duplicateLoad}>
      <input type="hidden" name="loadId" value={loadId} />
      <button
        type="submit"
        className="w-full rounded-xl border border-black/10 bg-white py-2.5 text-sm font-semibold text-ink hover:border-brand hover:text-brand-dark"
      >
        Duplicar
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