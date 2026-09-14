"use client";

import { useState } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !localStorage.getItem("movr_cookie_consent");
    } catch {
      return true;
    }
  });

  if (!visible) return null;

  const accept = () => {
    try {
      localStorage.setItem("movr_cookie_consent", "accepted");
    } catch {}
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-4 shadow-lg backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          We use only essential cookies (<code>movr_session</code>, <code>movr_locale</code>) for auth and language. See{" "}
          <Link href="/privacy" className="underline hover:text-ink">Privacy</Link> and <Link href="/terms" className="underline hover:text-ink">Terms</Link>.
        </p>
        <button onClick={accept} className="rounded-[var(--radius-input)] bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          Accept
        </button>
      </div>
    </div>
  );
}
