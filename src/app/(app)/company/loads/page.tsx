import { requireCompany } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { LoadCard } from "@/components/load-card";
import { ButtonLink } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CompanyLoadsPage() {
  const user = await requireCompany();
  const company = await prisma.company.findUnique({ where: { userId: user.id } });

  const loads = company
    ? await prisma.load.findMany({
        where: { companyId: company.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const openCount = loads.filter((l) => l.status === "OPEN").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Your loads</h1>
          <p className="mt-1 text-sm text-muted">
            {loads.length} total · {openCount} open for applications
          </p>
        </div>
        <ButtonLink href="/company/loads/new">New load</ButtonLink>
      </div>

      {!company && (
        <div className="rounded-2xl border border-brand/30 bg-brand-light p-4 text-sm text-brand-dark">
          Save your business details to publish loads.
          <div className="mt-3">
            <ButtonLink href="/company/settings">Set up business</ButtonLink>
          </div>
        </div>
      )}

      {company && loads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 p-10 text-center text-sm text-muted">
          No loads yet. Publish your first load to find carriers.
        </div>
      ) : (
        <div className="grid gap-3">
          {loads.map((load) => (
            <LoadCard key={load.id} load={load} href={`/company/loads/${load.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
