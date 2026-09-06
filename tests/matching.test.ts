import { test } from "node:test";
import assert from "node:assert/strict";
import { isCompatible, filterCompatible } from "@/lib/matching";
import type { Load, User, VehicleType } from "@/generated/prisma/client";

function mkLoad(overrides: Partial<Load>): Load {
  const base: Load = {
    id: "l1",
    companyId: "c1",
    publishedBy: "u1",
    origin: "Venlo",
    destination: "Venray",
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
    acceptsRegions: JSON.stringify(["Venlo", "Venray", "Roermond"]),
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
  assert.equal(isCompatible(carrier, mkLoad({ destination: "Venray" }), now), false);
});

test("isCompatible returns false for loads whose pickup date has passed", () => {
  const carrier = mkCarrier({});
  const past = new Date(Date.now() - 24 * 3600 * 1000);
  const future = new Date(Date.now() + 24 * 3600 * 1000);
  assert.equal(isCompatible(carrier, mkLoad({ destination: "Venray", pickupDate: past })), false);
  assert.equal(isCompatible(carrier, mkLoad({ destination: "Venray", pickupDate: future })), true);
});

test("isCompatible requires the destination to be a region the carrier serves", () => {
  const carrier = mkCarrier({});
  assert.equal(isCompatible(carrier, mkLoad({ destination: "Venray" })), true);
  assert.equal(isCompatible(carrier, mkLoad({ destination: "Tilburg" })), false);
});

test("isCompatible matches the required vehicle when specified", () => {
  const carrier = mkCarrier({});
  assert.equal(isCompatible(carrier, mkLoad({ destination: "Venray", requiredVehicle: "TRUCK" })), true);
  assert.equal(isCompatible(carrier, mkLoad({ destination: "Venray", requiredVehicle: "TRACTOR_TRAILER" })), false);
});

test("isCompatible allows loads with no required vehicle", () => {
  const carrier = mkCarrier({});
  assert.equal(isCompatible(carrier, mkLoad({ destination: "Venray", requiredVehicle: null })), true);
});

test("filterCompatible only returns compatible loads", () => {
  const carrier = mkCarrier({});
  const loads = [
    mkLoad({ id: "a", destination: "Venray", requiredVehicle: "TRUCK" }),
    mkLoad({ id: "b", destination: "Tilburg", requiredVehicle: null }),
    mkLoad({ id: "c", destination: "Roermond", requiredVehicle: "TRUCK" }),
  ];
  const result = filterCompatible(carrier, loads);
  assert.deepEqual(result.map((l) => l.id), ["a", "c"]);
});
