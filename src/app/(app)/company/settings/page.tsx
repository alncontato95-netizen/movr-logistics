import { requireCompany } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { CompanySettingsForm } from "@/components/CompanySettingsForm";
import { Card } from "@/components/ui";
import { ButtonLink } from "@/components/ui";

export default async function CompanySettingsPage() {
  const user = await requireCompany();
  const company = await prisma.company.findUnique({ where: { userId: user.id } });

  let summary = { loads: 0, open: 0, pending: 0, selected: 0 };
  if (company) {
    const loads = await prisma.load.findMany({
      where: { companyId: company.id },
      select: { status: true },
    });
    const applicationCounts = await prisma.application.count({
      where: { load: { companyId: company.id }, status: "PENDING" },
    });
    summary = {
      loads: loads.length,
      open: loads.filter((l) => l.status === "OPEN").length,
      pending: applicationCounts,
      selected: await prisma.application.count({
        where: { load: { companyId: company.id }, status: "SELECTED" },
      }),
    };
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Business details</h1>
        <p className="mt-1 text-sm text-muted">Company information shown to carriers when you publish loads.</p>
      </div>

      {company && !company.verified && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
          Your company is pending verification. Publishing will be enabled once approved.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Total loads" value={summary.loads} />
        <Metric label="Open" value={summary.open} tone="brand" />
        <Metric label="Pending interest" value={summary.pending} tone="amber" />
        <Metric label="Selected" value={summary.selected} tone="green" />
      </div>

      <Card>
        <CompanySettingsForm
          initial={{
            name: company?.name ?? "",
            kvk: company?.kvk ?? "",
            address: company?.address ?? "",
            phone: company?.phone ?? "",
          }}
        />
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-ink">Publish a load</p>
              <p className="text-sm text-muted">Add a new return load to find carriers.</p>
            </div>
            <ButtonLink href="/company/loads/new">New load</ButtonLink>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-ink">Manage loads</p>
              <p className="text-sm text-muted">Review candidates and progress.</p>
            </div>
            <ButtonLink href="/company/loads" variant="secondary">
              View loads
            </ButtonLink>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: "brand" | "amber" | "green" }) {
  const toneClass: Record<string, string> = {
    brand: "text-brand-dark",
    amber: "text-amber-600",
    green: "text-emerald-600",
  };
  return (
    <div className="rounded-2xl border border-black/8 bg-white p-4">
      <p className={`text-3xl font-extrabold ${tone ? toneClass[tone] : "text-ink"}`}>{value}</p>
      <p className="mt-1 text-xs font-medium text-muted">{label}</p>
    </div>
  );
}
