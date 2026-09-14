"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

type Props = {
  isCompany: boolean;
  t: {
    loads: string;
    business: string;
    applications: string;
    profile: string;
    dashboard: string;
    logout: string;
  };
};

export function MobileNav({ isCompany, t }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  // Close on route change (client-side navigation) so the panel never lingers.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- closing a transient menu on navigation is an external-sync
    close();
  }, [pathname]);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    // Defer so the click that opened the menu doesn't immediately close it.
    const raf = requestAnimationFrame(() => document.addEventListener("pointerdown", onPointerDown));
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2 text-ink hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d={open ? "M6 6L14 14M14 6L6 14" : "M3 6H17M3 10H17M3 14H17"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          id="mobile-menu"
          ref={panelRef}
          className="absolute inset-x-0 top-full z-[90] border-b border-border bg-white/95 shadow-[0_16px_40px_rgba(5,5,7,0.12)] backdrop-blur-xl"
        >
          <nav className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-3">
            {isCompany ? (
              <>
                <MobileLink href="/company/dashboard" onClick={close}>{t.dashboard}</MobileLink>
                <MobileLink href="/company/loads" onClick={close}>{t.loads}</MobileLink>
                <MobileLink href="/company/settings" onClick={close}>{t.business}</MobileLink>
              </>
            ) : (
              <>
                <MobileLink href="/carrier/dashboard" onClick={close}>{t.dashboard}</MobileLink>
                <MobileLink href="/loads" onClick={close}>{t.loads}</MobileLink>
                <MobileLink href="/applications" onClick={close}>{t.applications}</MobileLink>
                <MobileLink href="/profile" onClick={close}>{t.profile}</MobileLink>
              </>
            )}
            <div className="mt-2 border-t border-border pt-3">
              <LogoutButton label={t.logout} />
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink hover:bg-black/5">
      {children}
    </Link>
  );
}