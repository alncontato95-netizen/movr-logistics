import { cn } from "@/lib/cn";
import type { LoadStatus } from "@/lib/constants";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { formatDate } from "@/lib/format";

const ORDER: LoadStatus[] = ["OPEN", "SELECTED", "CONFIRMED", "PICKED_UP", "DELIVERED", "COMPLETED"];

function atOrPast(status: LoadStatus, min: LoadStatus): boolean {
  return ORDER.indexOf(status) >= ORDER.indexOf(min);
}

/**
 * Renders the full load lifecycle (interest → … → completed) as a compact
 * stepper. Purely presentational: derived from the load status and the
 * carrier's participation, no additional state.
 */
export function LoadLifecycle({
  status,
  applied,
  selected,
  locale,
}: {
  status: LoadStatus;
  applied: boolean;
  selected: boolean;
  locale: Locale;
}) {
  if (status === "OPEN" || status === "CANCELLED") return null;
  const t = getDictionary(locale).journey;

  const steps = [
    { label: t.stepInterest, done: applied },
    { label: t.stepSelected, done: selected || atOrPast(status, "SELECTED") },
    { label: t.stepConfirmed, done: atOrPast(status, "CONFIRMED") },
    { label: t.stepPickedUp, done: atOrPast(status, "PICKED_UP") },
    { label: t.stepDelivered, done: atOrPast(status, "DELIVERED") },
    { label: t.stepCompleted, done: status === "COMPLETED" },
  ];
  const currentIndex = steps.findIndex((s) => !s.done);

  return (
    <div className="rounded-2xl border border-black/8 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-muted">{t.title}</p>
      <ol className="mt-3 flex flex-wrap items-center gap-y-2">
        {steps.map((s, i) => (
          <li key={s.label} className="flex items-center">
            {i > 0 && <span className="mx-1.5 h-px w-3 bg-black/10" />}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                s.done
                  ? "bg-brand-light text-brand-dark"
                  : i === currentIndex
                    ? "bg-warning-50 text-warning-800 ring-1 ring-warning-200"
                    : "text-muted",
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full text-[10px] leading-none",
                  s.done ? "bg-brand text-white" : i === currentIndex ? "bg-warning-200 text-warning-800" : "bg-black/10 text-muted",
                )}
              >
                {s.done ? "✓" : i + 1}
              </span>
              {s.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Operational "Next up" panel for the active carrier during the
 * CONFIRMED → PICKED_UP → DELIVERED window: pickup details up top and a
 * stage-specific guidance line.
 */
export function OperationPanel({
  status,
  origin,
  destination,
  pickupDate,
  pickupWindow,
  locale,
}: {
  status: "CONFIRMED" | "PICKED_UP" | "DELIVERED";
  origin: string;
  destination: string;
  pickupDate: Date;
  pickupWindow: string | null;
  locale: Locale;
}) {
  const t = getDictionary(locale).journey;
  const hint =
    status === "CONFIRMED" ? t.confirmPickupHint : status === "PICKED_UP" ? t.pickedUpHint : t.deliveredHint;

  return (
    <div className="rounded-2xl border border-brand/15 bg-brand-light/40 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-brand-dark">{t.nextUp}</p>
      <dl className="mt-2 space-y-1.5 text-sm">
        <Row label={t.pickupAt} value={`${origin} · ${formatDate(pickupDate)}${pickupWindow ? ` · ${pickupWindow}` : ""}`} />
        <Row label={t.deliverTo} value={destination} />
      </dl>
      <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold text-brand-dark">{hint}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}