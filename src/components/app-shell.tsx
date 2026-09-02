import Link from "next/link";
import { LogoMark } from "@/components/brand";
import { LogoutButton } from "@/components/logout-button";
import { LangSwitcher } from "@/components/lang-switcher";
import { getDictionary, getLocale } from "@/lib/i18n";

export async function AppShell({
  user,
  children,
}: {
  user: { role: "CARRIER" | "COMPANY"; name: string };
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const isCompany = user.role === "COMPANY";
  return (
    <div className="flex min-h-full flex-col bg-[#fafafb]">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <Link href={isCompany ? "/company/loads" : "/loads"} className="flex items-center gap-2">
            <LogoMark size={24} />
            <span className="text-base font-extrabold tracking-tight text-ink">MOVR</span>
          </Link>
          <nav className="flex items-center gap-1">
            {isCompany ? (
              <>
                <NavLink href="/company/loads">{t.nav.loads}</NavLink>
                <NavLink href="/company/settings">{t.nav.business}</NavLink>
              </>
            ) : (
              <>
                <NavLink href="/loads">{t.nav.loads}</NavLink>
                <NavLink href="/applications">{t.nav.applications}</NavLink>
                <NavLink href="/profile">{t.nav.profile}</NavLink>
              </>
            )}
            <LangSwitcher />
            <LogoutButton label={t.nav.logout} />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-16">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex rounded-lg px-2.5 py-2 text-sm font-semibold text-muted hover:bg-black/5 hover:text-ink sm:px-3"
    >
      {children}
    </Link>
  );
}
