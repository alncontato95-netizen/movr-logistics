import type { Locale } from "@/lib/i18n";

export const VEHICLE_TYPES = ["VUC", "TOCO", "TRUCK", "BITRUCK", "CARRETA", "BITREM"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const CARGO_TYPES = ["PALLET", "CONTAINER", "BULK", "OTHER"] as const;
export type CargoType = (typeof CARGO_TYPES)[number];

export const LOAD_STATUSES = ["OPEN", "SELECTED", "CONFIRMED", "PICKED_UP", "DELIVERED", "COMPLETED", "CANCELLED"] as const;
export type LoadStatus = (typeof LOAD_STATUSES)[number];

export const APPLICATION_STATUSES = ["PENDING", "SELECTED", "ACCEPTED", "DECLINED", "REJECTED", "CANCELLED"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  VUC: "VUC (até 3,5t)",
  TOCO: "Toco (2 eixos)",
  TRUCK: "Truck (3 eixos)",
  BITRUCK: "Bitruck (4 eixos)",
  CARRETA: "Carreta (simples)",
  BITREM: "Bitrem",
};

export const CARGO_LABELS: Record<CargoType, string> = {
  PALLET: "Pallets",
  CONTAINER: "Container",
  BULK: "Bulk",
  OTHER: "Other",
};

export const LOAD_STATUS_LABELS: Record<LoadStatus, string> = {
  OPEN: "Open",
  SELECTED: "Carrier selected",
  CONFIRMED: "Confirmed",
  PICKED_UP: "Picked up",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "Pending",
  SELECTED: "Selected",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  REJECTED: "Not selected",
  CANCELLED: "Cancelled",
};

export function getCargoLabels(locale: Locale): Record<CargoType, string> {
  switch (locale) {
    case "nl":
      return { PALLET: "Pallets", CONTAINER: "Container", BULK: "Bulk", OTHER: "Overig" };
    case "de":
      return { PALLET: "Paletten", CONTAINER: "Container", BULK: "Schüttgut", OTHER: "Sonstiges" };
    case "es":
      return { PALLET: "Palés", CONTAINER: "Contenedor", BULK: "Granel", OTHER: "Otro" };
    default:
      return CARGO_LABELS;
  }
}

export function getVehicleLabels(locale: Locale): Record<VehicleType, string> {
  switch (locale) {
    case "nl":
      return {
        VUC: "VUC (até 3,5t)",
        TOCO: "Toco (2 eixos)",
        TRUCK: "Truck (3 eixos)",
        BITRUCK: "Bitruck (4 eixos)",
        CARRETA: "Carreta (simples)",
        BITREM: "Bitrem",
      };
    case "de":
      return {
        VUC: "VUC (até 3,5t)",
        TOCO: "Toco (2 eixos)",
        TRUCK: "Truck (3 eixos)",
        BITRUCK: "Bitruck (4 eixos)",
        CARRETA: "Carreta (simples)",
        BITREM: "Bitrem",
      };
    case "es":
      return {
        VUC: "VUC (até 3,5t)",
        TOCO: "Toco (2 eixos)",
        TRUCK: "Truck (3 eixos)",
        BITRUCK: "Bitruck (4 eixos)",
        CARRETA: "Carreta (simples)",
        BITREM: "Bitrem",
      };
    default:
      return VEHICLE_LABELS;
  }
}

export function getLoadStatusLabels(locale: Locale): Record<LoadStatus, string> {
  switch (locale) {
    case "nl":
      return {
        OPEN: "Open",
        SELECTED: "Vervoerder geselecteerd",
        CONFIRMED: "Bevestigd",
        PICKED_UP: "Opgehaald",
        DELIVERED: "Afgeleverd",
        COMPLETED: "Voltooid",
        CANCELLED: "Geannuleerd",
      };
    case "de":
      return {
        OPEN: "Offen",
        SELECTED: "Spediteur ausgewählt",
        CONFIRMED: "Bestätigt",
        PICKED_UP: "Abgeholt",
        DELIVERED: "Zugestellt",
        COMPLETED: "Abgeschlossen",
        CANCELLED: "Storniert",
      };
    case "es":
      return {
        OPEN: "Abierta",
        SELECTED: "Transportista seleccionado",
        CONFIRMED: "Confirmada",
        PICKED_UP: "Recogida",
        DELIVERED: "Entregada",
        COMPLETED: "Completada",
        CANCELLED: "Cancelada",
      };
    default:
      return LOAD_STATUS_LABELS;
  }
}

export function getApplicationStatusLabels(locale: Locale): Record<ApplicationStatus, string> {
  switch (locale) {
    case "nl":
      return {
        PENDING: "In afwachting",
        SELECTED: "Geselecteerd",
        ACCEPTED: "Geaccepteerd",
        DECLINED: "Afgewezen",
        REJECTED: "Niet geselecteerd",
        CANCELLED: "Geannuleerd",
      };
    case "de":
      return {
        PENDING: "Ausstehend",
        SELECTED: "Ausgewählt",
        ACCEPTED: "Angenommen",
        DECLINED: "Abgelehnt",
        REJECTED: "Nicht ausgewählt",
        CANCELLED: "Storniert",
      };
    case "es":
      return {
        PENDING: "Pendiente",
        SELECTED: "Seleccionada",
        ACCEPTED: "Aceptada",
        DECLINED: "Rechazada",
        REJECTED: "No seleccionada",
        CANCELLED: "Cancelada",
      };
    default:
      return APPLICATION_STATUS_LABELS;
  }
}

export const REGIONS = [
  "São Paulo",
  "Guarulhos",
  "Campinas",
  "Jundiaí",
  "Sorocaba",
  "São José dos Campos",
  "Santos",
  "Ribeirão Preto",
  "São José do Rio Preto",
  "Rio de Janeiro",
  "Duque de Caxias",
  "Niterói",
  "Volta Redonda",
  "Campos dos Goytacazes",
  "Petrópolis",
  "Belo Horizonte",
  "Uberlândia",
  "Contagem",
  "Betim",
  "Juiz de Fora",
  "Uberaba",
] as const;

export const REGION_OPTIONS = REGIONS.map((r) => ({ value: r, label: r }));
export type Region = (typeof REGIONS)[number];

/**
 * Default regions for the São Paulo/Rio de Janeiro/Belo Horizonte freight market.
 * 
 * To add new regions:
 * 1. Add the region name to this array
 * 2. Add translations to LOCALE_FLAGS in i18n.ts if needed
 * 3. Rerun type checking
 * 
 * Note: For production multi-market setups, consider making regions
 * configurable per user or storing them in a database table.
 */

export const ORGANIZATION = "MOVR Logistics";
export const TAGLINE = "Return loads, real partners.";

export const NOTIFICATION_TYPES = [
  "APPLICATION",
  "SELECTED",
  "ACCEPTED",
  "DECLINED",
  "CONFIRMED",
  "PICKED_UP",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "NEW_LOAD",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  APPLICATION: "👋",
  SELECTED: "🎯",
  ACCEPTED: "✅",
  DECLINED: "↩️",
  CONFIRMED: "📋",
  PICKED_UP: "📦",
  DELIVERED: "🏁",
  COMPLETED: "🎉",
  CANCELLED: "🚫",
  NEW_LOAD: "🆕",
};
