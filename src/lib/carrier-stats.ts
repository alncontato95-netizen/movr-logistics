import "server-only";

import { prisma } from "@/lib/prisma";

export type CarrierHistoryEntry = {
  loadId: string;
  origin: string;
  destination: string;
  pickupDate: Date;
  completedAt: Date;
  score: number;
  comment: string | null;
  companyName: string | null;
  companyVerified: boolean;
};

export type CarrierSummary = {
  carrierId: string;
  completedLoads: number;
  ratingCount: number;
  avgRating: number;
  relevance: number;
  history: CarrierHistoryEntry[];
};

/**
 * Relevance index 0–100, weight on trustworthiness:
 *  - rating quality: avg/5 weighted 60,
 *  - ratings volume: 20 when 10+ ratings,
 *  - completed-load record: 20 when 10+ completed.
 */
export function relevanceScore(completedLoads: number, ratingCount: number, avgRating: number): number {
  if (completedLoads === 0) return 0;
  const quality = Math.min((avgRating / 5) * 60, 60);
  const volume = Math.min((ratingCount / 10) * 20, 20);
  const track = Math.min((completedLoads / 10) * 20, 20);
  return Math.round(quality + volume + track);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export type CarrierOverview = Omit<CarrierSummary, "history">;

/** Lightweight summaries (no history) for a set of carriers — used on candidate lists. */
export async function getCarrierOverviews(carrierIds: string[]): Promise<Map<string, CarrierOverview>> {
  const result = new Map<string, CarrierOverview>();
  if (carrierIds.length === 0) return result;

  const [ratings, completed] = await Promise.all([
    prisma.rating.groupBy({
      by: ["carrierId"],
      where: { carrierId: { in: carrierIds } },
      _avg: { score: true },
      _count: { _all: true },
    }),
    prisma.application.findMany({
      where: { transporterId: { in: carrierIds }, status: "ACCEPTED", load: { status: "COMPLETED" } },
      select: { transporterId: true, loadId: true },
    }),
  ]);

  const completedByCarrier = new Map<string, number>();
  for (const app of completed) {
    completedByCarrier.set(app.transporterId, (completedByCarrier.get(app.transporterId) ?? 0) + 1);
  }

  for (const id of carrierIds) {
    const g = ratings.find((r) => r.carrierId === id);
    const ratingCount = g?._count._all ?? 0;
    const avgRating = g?._avg.score ?? 0;
    const completedLoads = completedByCarrier.get(id) ?? 0;
    result.set(id, {
      carrierId: id,
      completedLoads,
      ratingCount,
      avgRating,
      relevance: relevanceScore(completedLoads, ratingCount, avgRating),
    });
  }
  return result;
}

export async function getCarrierSummary(carrierId: string): Promise<CarrierSummary> {
  const [ratings, completedLoads] = await Promise.all([
    prisma.rating.findMany({
      where: { carrierId },
      orderBy: { createdAt: "desc" },
      include: {
        load: {
          select: { id: true, origin: true, destination: true, pickupDate: true },
        },
        company: { select: { name: true, verified: true } },
      },
    }),
    prisma.load.count({
      where: {
        status: "COMPLETED",
        applications: { some: { transporterId: carrierId, status: "ACCEPTED" } },
      },
    }),
  ]);

  const ratingCount = ratings.length;
  const avgRating = average(ratings.map((r) => r.score));

  const history: CarrierHistoryEntry[] = ratings.map((r) => ({
    loadId: r.loadId,
    origin: r.load.origin,
    destination: r.load.destination,
    pickupDate: r.load.pickupDate,
    completedAt: r.createdAt,
    score: r.score,
    comment: r.comment,
    companyName: r.company.name,
    companyVerified: r.company.verified,
  }));

  return {
    carrierId,
    completedLoads,
    ratingCount,
    avgRating,
    relevance: relevanceScore(completedLoads, ratingCount, avgRating),
    history,
  };
}