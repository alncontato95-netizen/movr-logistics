import type { Locale } from "@/lib/i18n";

export const VEHICLE_TYPES = ["VAN", "LIGHT_TRUCK", "TRUCK", "TRACTOR_TRAILER"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const CARGO_TYPES = ["PALLET", "CONTAINER", "BULK", "OTHER"] as const;
export type CargoType = (typeof CARGO_TYPES)[number];

export const LOAD_STATUSES = ["OPEN", "SELECTED", "CONFIRMED", "PICKED_UP", "DELIVERED", "COMPLETED", "CANCELLED"] as const;
export type LoadStatus = (typeof LOAD_STATUSES)[number];

export const APPLICATION_STATUSES = ["PENDING", "SELECTED", "ACCEPTED", "DECLINED", "REJECTED", "CANCELLED"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  VAN: "Van (≤3.5t)",
  LIGHT_TRUCK: "Light truck (3.5–7.5t)",
  TRUCK: "Truck (7.5–25t)",
  TRACTOR_TRAILER: "Tractor + trailer (40t)",
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
    case "pl":
      return { PALLET: "Palety", CONTAINER: "Kontener", BULK: "Luzem", OTHER: "Inne" };
    case "pt":
      return { PALLET: "Paletes", CONTAINER: "Contêiner", BULK: "Granel", OTHER: "Outro" };
    default:
      return CARGO_LABELS;
  }
}

export function getVehicleLabels(locale: Locale): Record<VehicleType, string> {
  switch (locale) {
    case "nl":
      return {
        VAN: "Bestelwagen (≤3,5t)",
        LIGHT_TRUCK: "Lichte vrachtwagen (3,5–7,5t)",
        TRUCK: "Vrachtwagen (7,5–25t)",
        TRACTOR_TRAILER: "Trekker + oplegger (40t)",
      };
    case "de":
      return {
        VAN: "Transporter (≤3,5t)",
        LIGHT_TRUCK: "Leicht-LKW (3,5–7,5t)",
        TRUCK: "LKW (7,5–25t)",
        TRACTOR_TRAILER: "Sattelzug (40t)",
      };
    case "pl":
      return {
        VAN: "Van (≤3,5t)",
        LIGHT_TRUCK: "Lekka ciężarówka (3,5–7,5t)",
        TRUCK: "Ciężarówka (7,5–25t)",
        TRACTOR_TRAILER: "Ciągnik + naczepa (40t)",
      };
    case "pt":
      return {
        VAN: "Van (≤3,5t)",
        LIGHT_TRUCK: "Caminhão leve (3,5–7,5t)",
        TRUCK: "Caminhão (7,5–25t)",
        TRACTOR_TRAILER: "Cavalo + carreta (40t)",
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
    case "pl":
      return {
        OPEN: "Otwarte",
        SELECTED: "Przewoźnik wybrany",
        CONFIRMED: "Potwierdzone",
        PICKED_UP: "Odebrane",
        DELIVERED: "Dostarczone",
        COMPLETED: "Zakończone",
        CANCELLED: "Anulowane",
      };
    case "pt":
      return {
        OPEN: "Aberta",
        SELECTED: "Transportador selecionado",
        CONFIRMED: "Confirmada",
        PICKED_UP: "Coletada",
        DELIVERED: "Entregue",
        COMPLETED: "Concluída",
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
    case "pl":
      return {
        PENDING: "Oczekujące",
        SELECTED: "Wybrane",
        ACCEPTED: "Zaakceptowane",
        DECLINED: "Odrzucone",
        REJECTED: "Nie wybrano",
        CANCELLED: "Anulowane",
      };
    case "pt":
      return {
        PENDING: "Pendente",
        SELECTED: "Selecionada",
        ACCEPTED: "Aceita",
        DECLINED: "Recusada",
        REJECTED: "Não selecionada",
        CANCELLED: "Cancelada",
      };
    default:
      return APPLICATION_STATUS_LABELS;
  }
}

export const REGIONS = [
  "Venlo",
  "Venray",
  "Roermond",
  "Weert",
  "Helmond",
  "Eindhoven",
  "Nijmegen",
  "Duiven",
  "Tilburg",
  "Breda",
  "Moerdijk",
  "Rotterdam",
] as const;

export const REGION_OPTIONS = REGIONS.map((r) => ({ value: r, label: r }));
export type Region = (typeof REGIONS)[number];

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
