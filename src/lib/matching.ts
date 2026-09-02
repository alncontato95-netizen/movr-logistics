import type { Load, User } from "@/generated/prisma/client";

export function regionsFor(regionsJson: string | null | undefined): string[] {
  if (!regionsJson) return [];
  try {
    const parsed = JSON.parse(regionsJson);
    if (Array.isArray(parsed)) return parsed.filter((r): r is string => typeof r === "string");
  } catch {
    return [];
  }
  return [];
}

/**
 * A load is compatible with a carrier when:
 *  - the carrier is available for loads,
 *  - the load is OPEN,
 *  - the pickup date has not passed,
 *  - the destination is in a region the carrier serves,
 *  - the required vehicle matches the carrier's vehicle (or none is required).
 */
export function isCompatible(
  carrier: Pick<User, "vehicleType" | "acceptsRegions" | "available">,
  load: Load,
  now: Date = new Date(),
): boolean {
  if (!carrier.available) return false;
  if (load.status !== "OPEN") return false;
  if (load.pickupDate.getTime() < now.getTime()) return false;

  const serves = regionsFor(carrier.acceptsRegions);
  if (serves.length && !serves.includes(load.destination)) return false;

  if (load.requiredVehicle && carrier.vehicleType && load.requiredVehicle !== carrier.vehicleType) return false;

  return true;
}

export function filterCompatible<T extends Load>(
  carrier: Pick<User, "vehicleType" | "acceptsRegions" | "available">,
  loads: T[],
): T[] {
  return loads.filter((load) => isCompatible(carrier, load));
}
