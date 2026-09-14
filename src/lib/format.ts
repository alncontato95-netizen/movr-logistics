function localeTag(locale?: string): string {
  switch (locale) {
    case "nl":
      return "nl-NL";
    case "de":
      return "de-DE";
    case "es":
      return "es-ES";
    default:
      return "en-GB";
  }
}

export function formatDate(date: Date | string, locale?: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(localeTag(locale), {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string, locale?: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(localeTag(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDayTime(date: Date | string, locale?: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString(localeTag(locale), {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatMonthDay(date: Date | string, locale?: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(localeTag(locale), {
    day: "numeric",
    month: "short",
  });
}

export function formatMoney(value: number, locale?: string): string {
  return new Intl.NumberFormat(localeTag(locale), { style: "currency", currency: "BRL" }).format(value);
}
