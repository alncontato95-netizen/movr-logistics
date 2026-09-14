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
        <p className="font-semibold text-brand-dark">Salve seus dados empresariais primeiro.</p>
        <p className="mt-1 text-sm text-muted">Você precisa de um perfil de empresa antes de editar cargas.</p>
        <div className="mt-4">
          <Link
            href="/company/settings"
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Configurar empresa
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
        <h1 className="text-2xl font-bold text-ink">Editar carga</h1>
        <p className="mt-1 text-sm text-muted">Atualize os detalhes da sua carga. Apenas cargas abertas podem ser editadas.</p>
      </div>
      <Card>
        <LoadForm load={load} action={updateLoad} />
      </Card>
    </div>
  );
}