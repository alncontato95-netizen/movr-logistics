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
  PALLET: "Paletes",
  CONTAINER: "Container",
  BULK: "Granel",
  OTHER: "Outro",
};

export const LOAD_STATUS_LABELS: Record<LoadStatus, string> = {
  OPEN: "Aberta",
  SELECTED: "Transportador selecionado",
  CONFIRMED: "Confirmada",
  PICKED_UP: "Coleta realizada",
  DELIVERED: "Entregue",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "Pendente",
  SELECTED: "Selecionada",
  ACCEPTED: "Aceita",
  DECLINED: "Recusada",
  REJECTED: "Não selecionada",
  CANCELLED: "Cancelada",
};

export function getCargoLabels(_locale: string): Record<CargoType, string> {
  return CARGO_LABELS;
}

export function getVehicleLabels(_locale: string): Record<VehicleType, string> {
  return VEHICLE_LABELS;
}

export function getLoadStatusLabels(_locale: string): Record<LoadStatus, string> {
  return LOAD_STATUS_LABELS;
}

export function getApplicationStatusLabels(_locale: string): Record<ApplicationStatus, string> {
  return APPLICATION_STATUS_LABELS;
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

export const ORGANIZATION = "MOVR Logística";
export const TAGLINE = "Cargas de retorno, parceiros de verdade.";

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
