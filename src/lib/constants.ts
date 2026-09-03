export const VEHICLE_TYPES = ["VAN", "LIGHT_TRUCK", "TRUCK", "TRACTOR_TRAILER"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const CARGO_TYPES = ["PALLET", "CONTAINER", "BULK", "OTHER"] as const;
export type CargoType = (typeof CARGO_TYPES)[number];

export const LOAD_STATUSES = ["OPEN", "SELECTED", "CONFIRMED", "IN_TRANSIT", "COMPLETED"] as const;
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
  IN_TRANSIT: "In transit",
  COMPLETED: "Completed",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "Pending",
  SELECTED: "Selected",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  REJECTED: "Not selected",
  CANCELLED: "Cancelled",
};

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
