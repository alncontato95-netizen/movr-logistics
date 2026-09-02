import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const { role } = await searchParams;
  const selectedRole = role === "company" ? "COMPANY" : role === "carrier" ? "CARRIER" : null;

  if (!selectedRole) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t.auth.joinTitle}</h1>
          <p className="mt-1 text-sm text-muted">{t.auth.joinSubtitle}</p>
        </div>
        <div className="grid gap-3">
          <RoleCard
            href="/register?role=carrier"
            title={t.auth.carrierRole}
            subtitle={t.auth.carrierRoleSub}
          />
          <RoleCard
            href="/register?role=company"
            title={t.auth.companyRole}
            subtitle={t.auth.companyRoleSub}
          />
        </div>
        <p className="text-center text-sm text-muted">
          {t.auth.alreadyAccount}{" "}
          <Link href="/login" className="font-semibold text-brand-dark hover:underline">
            {t.nav.login}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t.auth.createTitle}</h1>
        <p className="mt-1 text-sm text-muted">
          {selectedRole === "CARRIER" ? t.auth.carrierRole : t.auth.companyRole}
        </p>
      </div>
      <RegisterForm role={selectedRole} t={t.auth} />
      <p className="text-center text-sm text-muted">
        {t.auth.alreadyAccount}{" "}
        <Link href="/login" className="font-semibold text-brand-dark hover:underline">
          {t.nav.login}
        </Link>
      </p>
    </div>
  );
}

function RoleCard({ href, title, subtitle }: { href: string; title: string; subtitle: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-5 transition-colors hover:border-brand hover:bg-brand-light/40"
    >
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
      </div>
      <span className="text-2xl text-brand-dark">→</span>
    </Link>
  );
}
