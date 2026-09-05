import { LOCALES, LOCALE_COOKIE } from "@/lib/i18n";
import { setLocaleAction } from "@/app/actions/locale";
import { cookies } from "next/headers";

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  nl: "Nederlands",
  de: "Deutsch",
  pl: "Polski",
};

export async function LangSwitcher() {
  let current = "en";
  try {
    current = (await cookies()).get(LOCALE_COOKIE)?.value ?? "en";
  } catch {
    current = "en";
  }
  return (
    <form action={setLocaleAction} className="relative">
      <details className="group relative">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-[var(--radius-input)] border border-border bg-surface-strong px-2.5 py-1.5 text-xs font-semibold text-ink transition hover:border-brand/30 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 [&::-webkit-details-marker]:hidden">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-light text-[10px] font-bold text-brand-dark">
            {current.toUpperCase().slice(0, 2)}
          </span>
          <span className="hidden sm:inline">{LOCALE_LABELS[current] ?? current.toUpperCase()}</span>
          <span className="sm:hidden">{current.toUpperCase()}</span>
          <svg
            className="h-3 w-3 text-muted transition group-open:rotate-180"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
          >
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <div className="absolute right-0 z-30 mt-2 min-w-[160px] rounded-[var(--radius-card)] border border-border bg-surface-strong p-1 shadow-[var(--shadow-card)]">
          <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">Language</p>
          <div className="mt-1 flex flex-col gap-0.5">
            {LOCALES.map((code) => (
              <button
                key={code}
                name="locale"
                value={code}
                type="submit"
                aria-label={LOCALE_LABELS[code] ?? code.toUpperCase()}
                aria-current={code === current ? "true" : undefined}
                className={
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm font-medium transition " +
                  (code === current
                    ? "bg-brand text-white"
                    : "text-ink hover:bg-surface")
                }
              >
                <span className="flex items-center gap-2">
                  <span className={"flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold " + (code === current ? "bg-white/20 text-white" : "bg-brand-light text-brand-dark")}>
                    {code.toUpperCase()}
                  </span>
                  {LOCALE_LABELS[code] ?? code.toUpperCase()}
                </span>
                {code === current && (
                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M4 8L7 11L12 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </details>
    </form>
  );
}
