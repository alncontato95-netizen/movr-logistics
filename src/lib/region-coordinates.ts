export const REGION_COORDINATES: Record<string, [number, number]> = {
  Venlo: [51.3704, 6.1724],
  Venray: [51.5249, 5.9733],
  Roermond: [51.1942, 5.9870],
  Weert: [51.2514, 5.7061],
  Helmond: [51.4778, 5.6581],
  Eindhoven: [51.4416, 5.4697],
  Nijmegen: [51.8425, 5.8656],
  Duiven: [51.9471, 6.0218],
  Tilburg: [51.5714, 5.0678],
  Breda: [51.5718, 4.7683],
  Moerdijk: [51.6540, 4.6280],
  Rotterdam: [51.9244, 4.4777],
};

export function getRegionCoordinates(region: string): [number, number] | null {
  const coords = REGION_COORDINATES[region];
  return coords ?? null;
}
