"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot() {
  try {
    return !localStorage.getItem("movr_cookie_consent");
  } catch {
    return true;
  }
}

function getServerSnapshot() {
  return false;
}

function consentChanged() {
  for (const listener of listeners) listener();
}

export function CookieBanner() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!visible) return null;

  const accept = () => {
    try {
      localStorage.setItem("movr_cookie_consent", "accepted");
    } catch {}
    consentChanged();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-4 shadow-lg backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Usamos apenas cookies essenciais (<code>movr_session</code>, <code>movr_locale</code>) para autenticação e idioma. Veja{" "}
          <Link href="/privacy" className="underline hover:text-ink">Privacidade</Link> e{" "}
          <Link href="/terms" className="underline hover:text-ink">Termos</Link>.
        </p>
        <button onClick={accept} className="rounded-[var(--radius-input)] bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          Aceitar
        </button>
      </div>
    </div>
  );
}