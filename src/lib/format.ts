function localeTag(locale?: string): string {
  switch (locale) {
    case "nl":
      return "nl-NL";
    case "de":
      return "de-DE";
    case "pl":
      return "pl-PL";
    case "pt":
      return "pt-BR";
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

export function formatMoney(eur: number, locale?: string): string {
  return `€ ${eur.toLocaleString(localeTag(locale))}`;
}
