import { requireCompany } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { LoadCard } from "@/components/load-card";
import { PollRefresh } from "@/components/poll-refresh";
import { ButtonLink, Card } from "@/components/ui";
import Link from "next/link";
import { getLoadStatusLabels } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { LoadsViewToggle } from "@/components/loads-view-toggle";
import { getDictionary, getLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function CompanyLoadsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; sort?: string }> }) {
  const { status, q, sort } = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);
  const user = await requireCompany();
  const company = await prisma.company.findUnique({ where: { userId: user.id } });

  const allLoads = company
    ? await prisma.load.findMany({
        where: { companyId: company.id },
        orderBy: sort === "pickup" ? { pickupDate: "asc" } : sort === "price" ? { priceEur: "desc" } : { createdAt: "desc" },
        include: { rating: true },
      })
    : [];

  // filters
  let loads = allLoads;
  if (status && ["OPEN","SELECTED","CONFIRMED","PICKED_UP","DELIVERED","COMPLETED","CANCELLED"].includes(status)) {
    loads = loads.filter((l) => l.status === status);
  }
  if (q) {
    const term = q.toLowerCase();
    loads = loads.filter((l) => `${l.origin} ${l.destination} ${l.cargoType}`.toLowerCase().includes(term));
  }

  const openCount = allLoads.filter((l) => l.status === "OPEN").length;
  const selectedCount = allLoads.filter((l) => l.status === "SELECTED").length;
  const completedCount = allLoads.filter((l) => l.status === "COMPLETED").length;
  const cancelledCount = allLoads.filter((l) => l.status === "CANCELLED").length;
  const totalValue = allLoads.filter((l) => l.priceEur).reduce((s, l) => s + (l.priceEur ?? 0), 0);
  const avgRating = allLoads.filter((l) => l.rating).length ? (allLoads.filter((l) => l.rating).reduce((s, l) => s + (l.rating!.score), 0) / allLoads.filter((l) => l.rating).length).toFixed(1) : null;

  const buildHref = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const ns = over.status !== undefined ? over.status : status;
    const nq = over.q !== undefined ? over.q : q;
    const nsort = over.sort !== undefined ? over.sort : sort;
    if (ns) p.set("status", ns);
    if (nq) p.set("q", nq);
    if (nsort) p.set("sort", nsort);
    const s = p.toString();
    return s ? `/company/loads?${s}` : "/company/loads";
  };

  return (
    <div className="space-y-6">
      <PollRefresh intervalMs={15000} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Suas cargas</h1>
          <p className="mt-1 text-sm text-muted">
            {allLoads.length} no total · {openCount} abertas · {selectedCount} selecionadas · {completedCount} concluídas
            {cancelledCount ? ` · ${cancelledCount} canceladas` : ""} {avgRating ? `· ★${avgRating}` : ""}
          </p>
        </div>
        <ButtonLink href="/company/loads/new">Nova carga</ButtonLink>
      </div>

      {/* metadata */}
      {company && allLoads.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="p-4"><p className="text-2xl font-extrabold text-ink">{allLoads.length}</p><p className="text-xs text-muted">Total de cargas</p></Card>
          <Card className="p-4"><p className="text-2xl font-extrabold text-brand-dark">{formatMoney(totalValue) || "—"}</p><p className="text-xs text-muted">Valor total</p></Card>
          <Card className="p-4"><p className="text-2xl font-extrabold text-ink">{completedCount}</p><p className="text-xs text-muted">Concluídas</p></Card>
          <Card className="p-4"><p className="text-2xl font-extrabold text-ink">{avgRating ? `★ ${avgRating}` : "—"}</p><p className="text-xs text-muted">Média de avaliações</p></Card>
        </div>
      )}

      {/* filtros */}
      {company && allLoads.length > 0 && (
        <Card className="p-4">
          <form action="/company/loads" method="GET" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              <Link href={buildHref({ status: undefined })} className={`rounded-full px-3 py-1 text-xs font-semibold border ${!status ? "bg-brand text-white border-brand" : "bg-white text-muted border-border hover:border-brand/30"}`}>Todas</Link>
              { (["OPEN","SELECTED","CONFIRMED","COMPLETED","CANCELLED"] as const).map((s) => (
                <Link key={s} href={buildHref({ status: s })} className={`rounded-full px-3 py-1 text-xs font-semibold border ${status===s ? "bg-brand text-white border-brand" : "bg-white text-muted border-border hover:border-brand/30"}`}>{getLoadStatusLabels(locale)[s]}</Link>
              ))}
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <input name="q" defaultValue={q ?? ""} placeholder="Buscar origem/destino" className="min-w-0 flex-1 rounded-[var(--radius-input)] border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand" />
              <select name="sort" defaultValue={sort ?? "created"} className="rounded-[var(--radius-input)] border border-border bg-white px-2 py-2 text-sm">
                <option value="created">Mais recentes</option>
                <option value="pickup">Data de coleta</option>
                <option value="price">Maior preço</option>
              </select>
              <button type="submit" className="rounded-[var(--radius-input)] bg-brand px-3 py-2 text-sm font-semibold text-white">Filtrar</button>
            </div>
          </form>
        </Card>
      )}

      {!company && (
        <div className="rounded-2xl border border-brand/30 bg-brand-light p-4 text-sm text-brand-dark">
          Salve seus dados empresariais para publicar cargas.
          <div className="mt-3">
            <ButtonLink href="/company/settings">Configurar empresa</ButtonLink>
          </div>
        </div>
      )}

      {company && loads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 p-10 text-center text-sm text-muted">
          {allLoads.length === 0 ? "Nenhuma carga ainda. Publique sua primeira carga para encontrar transportadores." : "Nenhuma carga corresponde aos filtros."}
        </div>
      ) : (
        <LoadsViewToggle
          loads={loads}
          variant="company"
          listLabel={t.loads.list}
          mapLabel={t.loads.map}
          listContent={
            <div className="grid gap-3">
              {loads.map((load) => (
                <LoadCard key={load.id} load={load} href={`/company/loads/${load.id}`} locale={locale} />
              ))}
            </div>
          }
        />
      )}
    </div>
  );
}
