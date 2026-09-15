"use client";

import Link from "next/link";
import { completeOnboarding } from "@/app/actions/guide";

type GuideText = {
  title: string;
  subtitle: string;
  doCta: string;
  doneCta: string;
  closeLabel: string;
  carrierStepsTitle: string[];
  carrierStepsBody: string[];
  companyStepsTitle: string[];
  companyStepsBody: string[];
};

const STEP_LINKS = {
  CARRIER: ["/profile", "/loads", "/loads", "/applications"],
  COMPANY: ["/company/settings", "/company/loads/new", "/company/loads", "/company/loads"],
} as const;

export function FirstRunGuide({ role, t }: { role: "CARRIER" | "COMPANY"; t: GuideText }) {
  const titles = role === "CARRIER" ? t.carrierStepsTitle : t.companyStepsTitle;
  const bodies = role === "CARRIER" ? t.carrierStepsBody : t.companyStepsBody;
  const links = STEP_LINKS[role];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm sm:items-center sm:py-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="movr-guide-title"
    >
      <div className="w-full max-w-lg rounded-[var(--radius-card)] border border-black/8 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="movr-guide-title" className="text-xl font-extrabold text-ink">
              {t.title}
            </h2>
            <p className="mt-1 text-sm text-muted">{t.subtitle}</p>
          </div>
          <form action={completeOnboarding}>
            <button
              type="submit"
              aria-label={t.closeLabel}
              className="rounded-lg px-2 py-1 text-xl leading-none text-muted transition-colors hover:bg-black/5 hover:text-ink"
            >
              ×
            </button>
          </form>
        </div>

        <ol className="mt-5 space-y-3">
          {titles.map((title, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl border border-brand/10 bg-brand-light/40 p-3.5"
            >
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{title}</p>
                <p className="mt-0.5 text-sm text-muted">{bodies[i]}</p>
                <Link
                  href={links[i]}
                  className="mt-2 inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  {t.doCta} →
                </Link>
              </div>
            </li>
          ))}
        </ol>

        <form action={completeOnboarding} className="mt-5">
          <button
            type="submit"
            className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
          >
            {t.doneCta}
          </button>
        </form>
      </div>
    </div>
  );
}