import { LOCALES, LOCALE_COOKIE } from "@/lib/i18n";
import { setLocaleAction } from "@/app/actions/locale";
import { cookies } from "next/headers";

export async function LangSwitcher() {
  let current = "en";
  try {
    current = (await cookies()).get(LOCALE_COOKIE)?.value ?? "en";
  } catch {
    current = "en";
  }
  return (
    <form action={setLocaleAction} className="flex items-center gap-1">
      <span className="sr-only">Language</span>
      {LOCALES.map((code) => (
        <button
          key={code}
          name="locale"
          value={code}
          type="submit"
          aria-label={code.toUpperCase()}
          className={
            "rounded-md px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide transition " +
            (code === current
              ? "bg-brand/10 text-brand"
              : "text-muted hover:bg-black/5 hover:text-ink")
          }
        >
          {code}
        </button>
      ))}
    </form>
  );
}
