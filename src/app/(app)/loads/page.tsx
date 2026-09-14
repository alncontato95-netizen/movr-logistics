import { requireCarrier } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { filterCompatible, regionsFor } from "@/lib/matching";
import { LoadCard } from "@/components/load-card";
import { PollRefresh } from "@/components/poll-refresh";
import { ButtonLink } from "@/components/ui";
import { LoadsViewToggle } from "@/components/loads-view-toggle";
import { getDictionary, getLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function LoadsPage() {
  const user = await requireCarrier();
  const locale = await getLocale();
  const t = getDictionary(locale);
  const incomplete = !user.vehicleType || !user.currentRegion;

  const allLoads = await prisma.load.findMany({
    where: { status: "OPEN" },
    orderBy: { pickupDate: "asc" },
  });

  const compatible = filterCompatible(user, allLoads);
  const serves = regionsFor(user.acceptsRegions);

  const listContent =
    compatible.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-black/15 p-10 text-center text-sm text-muted">
        Nenhuma carga compatível no momento. Volte em breve ou amplie as regiões que você atende.
      </div>
    ) : (
      <div className="grid gap-3">
        {compatible.map((load) => (
          <LoadCard key={load.id} load={load} href={`/loads/${load.id}`} matchLabel="Compatível com você" locale={locale} />
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      <PollRefresh intervalMs={15000} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Cargas para você</h1>
          <p className="mt-1 text-sm text-muted">
            {compatible.length} {compatible.length === 1 ? "carga compatível" : "cargas compatíveis"} agora.
          </p>
        </div>
        <ButtonLink href="/profile" variant="secondary">
          Editar perfil
        </ButtonLink>
      </div>

      {incomplete && (
        <div className="rounded-2xl border border-brand/30 bg-brand-light p-4 text-sm text-brand-dark">
          <p className="font-semibold">Complete seu perfil para ver cargas compatíveis.</p>
          <p className="mt-1">Adicione o tipo do seu veículo e sua região de origem para começar.</p>
          <div className="mt-3">
            <ButtonLink href="/profile">Completar perfil</ButtonLink>
          </div>
        </div>
      )}

      {!user.available && (
        <div className="rounded-2xl border border-warning-300 bg-warning-50 p-4 text-sm text-warning-800">
          <p className="font-semibold">Você está marcado como indisponível no momento.</p>
          <p className="mt-1">Ative &quot;Disponível para cargas agora&quot; no seu perfil para ser combinado com novas cargas.</p>
          <div className="mt-3">
            <ButtonLink href="/profile" variant="secondary">Marcar como disponível</ButtonLink>
          </div>
        </div>
      )}

      {serves.length === 0 ? (
        <div className="rounded-2xl border border-warning-200 bg-warning-50 p-6 text-center">
          <p className="font-semibold text-warning-800">Complete seu perfil para ver cargas disponíveis</p>
          <p className="mt-1 text-sm text-warning-700">
            Selecione as regiões que você atende no seu perfil para mostrarmos cargas compatíveis com suas rotas.
          </p>
          <div className="mt-4">
            <ButtonLink href="/profile">Ir para o perfil</ButtonLink>
          </div>
        </div>
      ) : (
        <LoadsViewToggle loads={compatible} variant="carrier" listLabel={t.loads.list} mapLabel={t.loads.map} listContent={listContent} />
      )}
    </div>
  );
}
