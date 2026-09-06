"use client";

import dynamic from "next/dynamic";

export const RouteMap = dynamic(
  () => import("@/components/route-map").then((mod) => mod.RouteMap),
  { ssr: false, loading: () => <div className="flex h-[220px] items-center justify-center rounded-[var(--radius-card)] border border-border text-sm text-muted">Loading map…</div> }
);
