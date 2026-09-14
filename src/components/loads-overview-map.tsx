"use client";

import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getRegionCoordinates } from "@/lib/region-coordinates";
import type { LoadStatus } from "@/lib/constants";

// Fix icon (also for overview, though we use divIcon, keep for fallback)
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const STATUS_COLOR: Record<LoadStatus, string> = {
  OPEN: "#3aaf42",
  SELECTED: "#d97706",
  CONFIRMED: "#0284c7",
  PICKED_UP: "#0284c7",
  DELIVERED: "#38bdf8",
  COMPLETED: "#6b7280",
  CANCELLED: "#9ca3af",
};

function colorForStatus(status: LoadStatus): string {
  return STATUS_COLOR[status] ?? "#6b7280";
}

function createColorIcon(color: string) {
  return L.divIcon({
    className: "custom-div-icon",
    html: `<span style="background:${color};width:14px;height:14px;border-radius:50%;display:block;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -7],
  });
}

type LoadLite = {
  id: string;
  origin: string;
  destination: string;
  status: LoadStatus;
};

type Props = {
  loads: LoadLite[];
  variant: "carrier" | "company";
  height?: number | string;
};

export function LoadsOverviewMap({ loads, variant, height = 400 }: Props) {
  const points = loads
    .map((l) => {
      const coords = getRegionCoordinates(l.destination);
      if (!coords) return null;
      // also ensure origin exists? spec says omit if origin or destination not in map
      const originCoords = getRegionCoordinates(l.origin);
      if (!originCoords) return null;
      return { load: l, coords };
    })
    .filter(Boolean) as { load: LoadLite; coords: [number, number] }[];

  if (points.length === 0) return null;

  const bounds: L.LatLngBoundsExpression = points.map((p) => p.coords);

  // if single point, need to give some zoom, bounds will still work but need padding
  const single = points.length === 1;

  return (
    <div style={{ height }} className="overflow-hidden rounded-[var(--radius-card)] border border-border">
      <MapContainer
        bounds={bounds as L.LatLngBoundsExpression}
        boundsOptions={{ padding: [32, 32] } as L.ZoomPanOptions}
        center={single ? points[0].coords : undefined}
        zoom={single ? 10 : undefined}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer attribution='© OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map(({ load, coords }) => (
          <Marker key={load.id} position={coords} icon={createColorIcon(colorForStatus(load.status))}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">
                  {load.origin} → {load.destination}
                </div>
                <div className="text-xs text-muted">{load.status}</div>
                <Link
                  href={variant === "company" ? `/company/loads/${load.id}` : `/loads/${load.id}`}
                  className="mt-1 inline-block text-xs font-semibold text-brand underline"
                >
                  View details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
