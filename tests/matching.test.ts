import { test } from "node:test";
import assert from "node:assert/strict";
import { isCompatible, filterCompatible } from "@/lib/matching";
import { pickupWindowStart, pickupReadyAt, canConfirmPickup } from "@/lib/schedule";
import type { Load, User, VehicleType } from "@/generated/prisma/client";

function mkLoad(overrides: Partial<Load>): Load {
  const base: Load = {
    id: "l1",
    companyId: "c1",
    publishedBy: "u1",
    origin: "São Paulo",
    destination: "Campinas",
    pickupDate: new Date(Date.now() + 24 * 3600 * 1000),
    pickupWindow: null,
    cargoType: "PALLET",
    weightKg: 1000,
    volumeM3: null,
    requiredVehicle: null,
    priceEur: null,
    priceNegotiable: true,
    notes: null,
    podUrl: null,
    podNote: null,
    status: "OPEN",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return { ...base, ...overrides };
}

function mkCarrier(overrides: Partial<User>): Pick<User, "vehicleType" | "acceptsRegions" | "available"> {
  return {
    vehicleType: "TRUCK" as VehicleType,
    acceptsRegions: JSON.stringify(["São Paulo", "Campinas", "Guarulhos"]),
    available: true,
    ...(overrides as Partial<Pick<User, "vehicleType" | "acceptsRegions" | "available">>),
  };
}

test("isCompatible returns false for non-OPEN loads", () => {
  const carrier = mkCarrier({});
  assert.equal(isCompatible(carrier, mkLoad({ status: "SELECTED" })), false);
  assert.equal(isCompatible(carrier, mkLoad({ status: "COMPLETED" })), false);
});

test("isCompatible returns false when the carrier is unavailable", () => {
  const now = new Date();
  const carrier = mkCarrier({ available: false });
  assert.equal(isCompatible(carrier, mkLoad({ destination: "Campinas" }), now), false);
});

test("isCompatible returns false for loads whose pickup date has passed", () => {
  const carrier = mkCarrier({});
  const past = new Date(Date.now() - 24 * 3600 * 1000);
  const future = new Date(Date.now() + 24 * 3600 * 1000);
  assert.equal(isCompatible(carrier, mkLoad({ destination: "Campinas", pickupDate: past })), false);
  assert.equal(isCompatible(carrier, mkLoad({ destination: "Campinas", pickupDate: future })), true);
});

test("isCompatible requires the destination to be a region the carrier serves", () => {
  const carrier = mkCarrier({});
  assert.equal(isCompatible(carrier, mkLoad({ destination: "Campinas" })), true);
  assert.equal(isCompatible(carrier, mkLoad({ destination: "Rio de Janeiro" })), false);
});

test("isCompatible matches the required vehicle when specified", () => {
  const carrier = mkCarrier({});
  assert.equal(isCompatible(carrier, mkLoad({ destination: "Campinas", requiredVehicle: "TRUCK" })), true);
  assert.equal(isCompatible(carrier, mkLoad({ destination: "Campinas", requiredVehicle: "CARRETA" })), false);
});

test("isCompatible allows loads with no required vehicle", () => {
  const carrier = mkCarrier({});
  assert.equal(isCompatible(carrier, mkLoad({ destination: "Campinas", requiredVehicle: null })), true);
});

test("filterCompatible only returns compatible loads", () => {
  const carrier = mkCarrier({});
  const loads = [
    mkLoad({ id: "a", destination: "Campinas", requiredVehicle: "TRUCK" }),
    mkLoad({ id: "b", destination: "Rio de Janeiro", requiredVehicle: null }),
    mkLoad({ id: "c", destination: "Guarulhos", requiredVehicle: "TRUCK" }),
  ];
  const result = filterCompatible(carrier, loads);
  assert.deepEqual(result.map((l) => l.id), ["a", "c"]);
});

test("pickupWindowStart parses the window start hour", () => {
  assert.deepEqual(pickupWindowStart("08:00 – 11:00"), { hour: 8, minute: 0 });
  assert.deepEqual(pickupWindowStart("14:00 - 17:00"), { hour: 14, minute: 0 });
  assert.deepEqual(pickupWindowStart("09.30 - 12.00"), { hour: 9, minute: 30 });
  assert.equal(pickupWindowStart(null), null);
  assert.equal(pickupWindowStart("any time"), null);
});

test("pickupReadyAt falls back to the scheduled day when no window is set", () => {
  const pickupDate = new Date("2026-09-20T00:00:00.000Z");
  const ready = pickupReadyAt(pickupDate, null);
  assert.equal(ready.getFullYear(), 2026);
  assert.equal(ready.getMonth(), 8);
  assert.equal(ready.getDate(), 20);
  assert.equal(ready.getHours(), 0);
});

test("pickupReadyAt uses the pickup window start on the scheduled day", () => {
  const pickupDate = new Date("2026-09-20T00:00:00.000Z");
  const ready = pickupReadyAt(pickupDate, "08:00 – 11:00");
  assert.equal(ready.getFullYear(), 2026);
  assert.equal(ready.getMonth(), 8);
  assert.equal(ready.getDate(), 20);
  assert.equal(ready.getHours(), 8);
  assert.equal(ready.getMinutes(), 0);
});

test("canConfirmPickup rejects before the window and allows delays afterwards", () => {
  const pickupDate = new Date("2026-09-20T00:00:00.000Z");
  assert.equal(canConfirmPickup(pickupDate, "08:00 – 11:00", new Date(2026, 8, 20, 7, 59)), false);
  assert.equal(canConfirmPickup(pickupDate, "08:00 – 11:00", new Date(2026, 8, 20, 8, 0)), true);
  assert.equal(canConfirmPickup(pickupDate, "08:00 – 11:00", new Date(2026, 8, 20, 13, 30)), true);
  assert.equal(canConfirmPickup(pickupDate, "08:00 – 11:00", new Date(2026, 8, 21, 9, 0)), true);
});

test("canConfirmPickup allows the whole scheduled day when no window is set", () => {
  const pickupDate = new Date("2026-09-20T00:00:00.000Z");
  assert.equal(canConfirmPickup(pickupDate, null, new Date(2026, 8, 19, 23, 59)), false);
  assert.equal(canConfirmPickup(pickupDate, null, new Date(2026, 8, 20, 0, 0)), true);
});
