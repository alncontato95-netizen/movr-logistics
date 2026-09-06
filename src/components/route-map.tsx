"use client";

import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getRegionCoordinates } from "@/lib/region-coordinates";

// Fix broken marker icons with Next.js bundler
// Use CDN assets to ensure icons appear correctly
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Props = {
  origin: string;
  destination: string;
  height?: number | string;
};

export function RouteMap({ origin, destination, height = 220 }: Props) {
  const originCoords = getRegionCoordinates(origin);
  const destCoords = getRegionCoordinates(destination);

  if (!originCoords || !destCoords) return null;

  const bounds: L.LatLngBoundsExpression = [originCoords, destCoords];

  return (
    <div style={{ height }} className="overflow-hidden rounded-[var(--radius-card)] border border-border">
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [24, 24] } as any}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        dragging={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='© OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={originCoords} />
        <Marker position={destCoords} />
        <Polyline positions={[originCoords, destCoords]} color="#3aaf42" weight={4} opacity={0.85} />
      </MapContainer>
    </div>
  );
}
