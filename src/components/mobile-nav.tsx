"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

type Props = {
  isCompany: boolean;
  t: {
    loads: string;
    business: string;
    applications: string;
    profile: string;
    logout: string;
  };
};

export function MobileNav({ isCompany, t }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2 text-ink hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d={open ? "M6 6L14 14M14 6L6 14" : "M3 6H17M3 10H17M3 14H17"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-30 border-b border-border bg-white/95 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-3">
            {isCompany ? (
              <>
                <MobileLink href="/company/loads" onClick={() => setOpen(false)}>{t.loads}</MobileLink>
                <MobileLink href="/company/settings" onClick={() => setOpen(false)}>{t.business}</MobileLink>
              </>
            ) : (
              <>
                <MobileLink href="/loads" onClick={() => setOpen(false)}>{t.loads}</MobileLink>
                <MobileLink href="/applications" onClick={() => setOpen(false)}>{t.applications}</MobileLink>
                <MobileLink href="/profile" onClick={() => setOpen(false)}>{t.profile}</MobileLink>
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
