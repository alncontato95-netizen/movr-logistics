"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { LoadStatus } from "@/lib/constants";

const LoadsOverviewMap = dynamic(
  () => import("@/components/loads-overview-map").then((mod) => mod.LoadsOverviewMap),
  { ssr: false, loading: () => <div className="flex h-[420px] items-center justify-center rounded-[var(--radius-card)] border border-border text-sm text-muted">Loading map…</div> }
);

type LoadLite = {
  id: string;
  origin: string;
  destination: string;
  status: LoadStatus;
};

type Props = {
  loads: LoadLite[];
  variant: "carrier" | "company";
  listLabel: string;
  mapLabel: string;
  listContent: React.ReactNode;
};

export function LoadsViewToggle({ loads, variant, listLabel, mapLabel, listContent }: Props) {
  const [view, setView] = useState<"list" | "map">("list");

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setView("list")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition ${view === "list" ? "bg-brand text-white border-brand" : "bg-white text-ink border-border hover:border-brand/30"}`}
        >
          {listLabel}
        </button>
        <button
          type="button"
          onClick={() => setView("map")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition ${view === "map" ? "bg-brand text-white border-brand" : "bg-white text-ink border-border hover:border-brand/30"}`}
        >
          {mapLabel}
        </button>
      </div>
      {view === "list" ? listContent : <LoadsOverviewMap loads={loads} variant={variant} height={420} />}
    </div>
  );
}
