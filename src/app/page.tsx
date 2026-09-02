import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { LogoMark } from "@/components/brand";
import { LangSwitcher } from "@/components/lang-switcher";
import { getCurrentUser } from "@/lib/dal";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function HomePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  let currentUser: Awaited<ReturnType<typeof getCurrentUser>> | null = null;
  try {
    currentUser = await getCurrentUser();
  } catch {
    currentUser = null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark />
          <span className="text-lg font-extrabold tracking-tight text-ink">MOVR</span>
        </Link>
        <nav className="flex items-center gap-2">
          <LangSwitcher />
          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                href={currentUser.role === "COMPANY" ? "/company/loads" : "/loads"}
                className="rounded-xl bg-brand px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                {t.nav.dashboard}
              </Link>
              <LogoutButton label={t.nav.logout} />
            </div>
          ) : (
            <>
              <Link href="/login" className="rounded-xl px-3.5 py-2 text-sm font-semibold text-ink hover:bg-black/5">
                {t.nav.login}
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-brand px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                {t.nav.signup}
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16">
        <section className="pb-12 pt-10 text-center">
          <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            {t.landing.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{t.landing.subtitle}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register?role=carrier"
              className="rounded-xl bg-brand px-6 py-3 text-center font-semibold text-white hover:bg-brand-dark"
            >
              {t.landing.carrierCta}
            </Link>
            <Link
              href="/register?role=company"
              className="rounded-xl border border-black/10 bg-white px-6 py-3 text-center font-semibold text-ink hover:border-brand hover:bg-brand-light/40"
            >
              {t.landing.companyCta}
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <Feature title={t.landing.featureCarrierTitle} body={t.landing.featureCarrierBody} />
          <Feature title={t.landing.featureCompanyTitle} body={t.landing.featureCompanyBody} />
          <Feature title={t.landing.featureEmptyTitle} body={t.landing.featureEmptyBody} />
        </section>

        <section className="mt-12 rounded-3xl bg-brand-light/50 p-6 sm:p-10">
          <h2 className="text-xl font-bold text-ink">{t.landing.howTitle}</h2>
          <ol className="mt-4 grid gap-4 sm:grid-cols-3">
            <Step n={1} title={t.landing.step1Title} body={t.landing.step1Body} />
            <Step n={2} title={t.landing.step2Title} body={t.landing.step2Body} />
            <Step n={3} title={t.landing.step3Title} body={t.landing.step3Body} />
          </ol>
        </section>
      </main>

      <footer className="border-t border-black/5 py-6 text-center text-sm text-muted">
        MOVR Logistics — Venlo, Limburg, NL
      </footer>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-white p-5">
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
        {n}
      </span>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-1 text-sm text-muted">{body}</p>
      </div>
    </li>
  );
}
