import { notFound, redirect } from "next/navigation";
import { requireCompany } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { LoadForm } from "@/components/LoadForm";
import { updateLoad } from "@/app/actions/loads";
import { Card } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditLoadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireCompany();
  const company = await prisma.company.findUnique({ where: { userId: user.id } });

  if (!company) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-brand/30 bg-brand-light p-6 text-center">
        <p className="font-semibold text-brand-dark">Save your business details first.</p>
        <p className="mt-1 text-sm text-muted">You need a company profile before editing loads.</p>
        <div className="mt-4">
          <Link
            href="/company/settings"
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Set up business
          </Link>
        </div>
      </div>
    );
  }

  const load = await prisma.load.findUnique({ where: { id } });
  if (!load || load.companyId !== company.id) notFound();
  if (load.status !== "OPEN") redirect(`/company/loads/${id}`);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Edit load</h1>
        <p className="mt-1 text-sm text-muted">Update your load details. Only open loads can be edited.</p>
      </div>
      <Card>
        <LoadForm load={load} action={updateLoad} />
      </Card>
    </div>
  );
}
