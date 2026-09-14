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
        ← Voltar para cargas
      </Link>

      {applied && appliedPending && (
        <div className="rounded-2xl bg-brand-light p-4 text-sm font-semibold text-brand-dark">
          Interesse enviado. A empresa vai analisar as candidaturas e selecionar o transportador.
        </div>
      )}

      {podError && (
        <div className="rounded-2xl bg-error-light p-4 text-sm font-semibold text-error">
          Falha no envio do comprovante. Use imagem JPG/PNG/WebP ou PDF de até 5MB, ou um link https:// válido.
        </div>
      )}

      {earlyPickup && (
        <div className="rounded-2xl bg-warning-50 p-4 text-sm font-semibold text-warning-800">
          {t.journey.earlyPickup}
        </div>
      )}

      {accepted && (
        <div className="rounded-2xl bg-success-light p-4 text-sm font-semibold text-success-700">
          Proposta aceita. A empresa vai confirmar a reserva.
        </div>
      )}

      {declined && (
        <div className="rounded-2xl bg-error-light p-4 text-sm font-semibold text-error-700">
          Você recusou a proposta. Esta carga está aberta para outros transportadores.
        </div>
      )}

      {pickedUp && (
        <div className="rounded-2xl bg-info-50 p-4 text-sm font-semibold text-info-800">
          Coleta confirmada. A carga está a caminho.
        </div>
      )}

      {delivered && (
        <div className="rounded-2xl bg-success-light p-4 text-sm font-semibold text-success-700">
          Entrega confirmada. Aguardando confirmação da empresa.
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
          {load.requiredVehicle ? (
            <Row label="Veículo necessário" value={VEHICLE_LABELS[load.requiredVehicle]} />
          ) : (
            <Row label="Veículo necessário" value="Qualquer" />
          )}
          {load.priceEur ? <Row label="Preço ofertado" value={formatMoney(load.priceEur)} /> : null}
          <Row label="Preço" value={load.priceNegotiable ? "Negociável" : "Fixo"} />
          {load.pickupWindow ? <Row label="Janela de coleta" value={load.pickupWindow} /> : null}
          {load.notes ? <Row label="Observações" value={load.notes} /> : null}
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
        <p className="text-sm font-semibold text-muted">Publicado por</p>
        <p className="mt-1 font-semibold text-ink">{load.company.user.name}</p>
        {load.company.name && <p className="text-sm text-muted">{load.company.name}</p>}
        {myApplication &&
          (myApplication.status === "SELECTED" ||
            myApplication.status === "ACCEPTED" ||
            load.status === "CONFIRMED" ||
            load.status === "PICKED_UP" ||
            load.status === "DELIVERED") && (
            <div className="mt-3 rounded-xl bg-brand-light/60 p-3 text-sm">
              <p className="font-semibold text-brand-dark">Dados de contato</p>
              {load.company.phone && <p className="mt-1 break-words text-ink">Telefone: {load.company.phone}</p>}
              {load.company.user.email && <p className="break-all text-ink">E-mail: {load.company.user.email}</p>}
              <p className="mt-1 text-xs text-muted">Entre em contato para combinar a coleta — a empresa aguarda seu contato sobre esta carga.</p>
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

      {load.status === "COMPLETED" && rating && (
        <div className="rounded-2xl border border-black/8 bg-white p-4 text-center">
          <p className="font-semibold text-ink">Sua avaliação: ★ {rating.score}</p>
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
              A empresa selecionou você para esta carga. Aceite a proposta para reservá-la.
            </p>
            <div className="flex gap-2">
              <form action={declineOffer} className="flex-1">
                <input type="hidden" name="loadId" value={load.id} />
                <button
                  type="submit"
                  className="w-full rounded-xl border border-black/10 bg-white py-3.5 text-sm font-semibold text-ink hover:border-error-400 hover:text-error-600"
                >
                  Recusar
                </button>
              </form>
              <form action={acceptOffer} className="flex-1">
                <input type="hidden" name="loadId" value={load.id} />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/30 hover:bg-brand-dark"
                >
                  Aceitar proposta
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
              Confirmar entrega
            </button>
          </form>
        ) : appliedPending ? (
          <form action={cancelApplication}>
            <input type="hidden" name="loadId" value={load.id} />
            <button
              type="submit"
              className="w-full rounded-xl border border-black/10 bg-white py-3.5 text-sm font-semibold text-ink hover:border-error-400 hover:text-error-600"
            >
              Retirar interesse
            </button>
          </form>
        ) : canApply ? (
          <form action={applyToLoad}>
            <input type="hidden" name="loadId" value={load.id} />
            <button
              type="submit"
              className="w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/30 hover:bg-brand-dark"
            >
              Demonstrar interesse nesta carga
            </button>
          </form>
        ) : (
          <div className="rounded-xl bg-black/5 py-3.5 text-center text-sm font-semibold text-muted">
            {myApplication?.status === "ACCEPTED" && load.status === "DELIVERED" ? (
              <Badge tone="green">Entregue — aguardando confirmação da empresa</Badge>
            ) : myApplication?.status === "ACCEPTED" ? (
              <Badge tone="green">Proposta aceita — a empresa já pode confirmar a reserva</Badge>
            ) : myApplication?.status === "DECLINED" ? (
              <Badge tone="red">Você recusou esta proposta — está aberta para outros transportadores</Badge>
            ) : myApplication?.status === "REJECTED" ? (
              <Badge tone="red">Não selecionado para esta carga</Badge>
            ) : (
              <Badge>Não está aberta para candidaturas</Badge>
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
