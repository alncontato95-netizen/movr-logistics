import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

const COMPANY_EMAIL = "company@movr.dev";

const CARRIERS = [
  { email: "mateus@movr.dev", password: "mateus123", loads: 10 },
  { email: "angelika@movr.dev", password: "angelika123", loads: 10 },
];

const SCORES = [5, 5, 4, 5, 5, 4, 5, 5, 4, 5];
const COMMENTS = [
  "Rapid, careful and right on time.",
  "Load arrived perfect and secured well.",
  "Great communication from start to finish.",
  "Delivered on schedule, everything correct.",
  "Professional driver, easy to work with.",
];

const ROUTES: Array<[string, string]> = [
  ["São Paulo", "Campinas"],
  ["Guarulhos", "Jundiaí"],
  ["Santos", "São Paulo"],
  ["Ribeirão Preto", "São Paulo"],
  ["Campinas", "Guarulhos"],
  ["Sorocaba", "Campinas"],
  ["Jundiaí", "Sorocaba"],
  ["São Paulo", "Ribeirão Preto"],
  ["São José dos Campos", "São Paulo"],
  ["Jundiaí", "Campinas"],
  ["Santos", "Guarulhos"],
  ["Campinas", "São Paulo"],
];

async function ensureCarrier(email: string, password: string) {
  let user = await prisma.user.findUnique({ where: { email } });
  if (user) return user;
  const passwordHash = await bcrypt.hash(password, 10);
  user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: email === "mateus@movr.dev" ? "Mateus Luiz" : "Angelika Tester",
      role: "CARRIER",
      vehicleType: "TRUCK",
      currentRegion: "São Paulo",
      acceptsRegions: JSON.stringify(["São Paulo", "Guarulhos", "Campinas", "Jundiaí", "Sorocaba", "Santos"]),
      available: true,
    },
  });
  return user;
}

async function main() {
  const companyUser = await prisma.user.findUnique({ where: { email: COMPANY_EMAIL } });
  if (!companyUser) throw new Error(`Demo company user not found: ${COMPANY_EMAIL}. Run "npm run db:seed" first.`);

  const company = await prisma.company.findUnique({ where: { userId: companyUser.id } });
  if (!company) throw new Error("Demo company profile not found.");

  const completedAt = (daysAgo: number, hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  for (const spec of CARRIERS) {
    const carrier = await ensureCarrier(spec.email, spec.password);

    const existing = await prisma.rating.count({
      where: { carrierId: carrier.id, companyId: company.id },
    });
    if (existing > 0) {
      console.log(`  ${spec.email}: history already seeded (${existing} ratings), skipping.`);
      continue;
    }

    const created = [];
    for (let i = 0; i < spec.loads; i++) {
      const [origin, destination] = ROUTES[i % ROUTES.length];
      const reportDays = 55 - i * 5;
      const loadDate = completedAt(reportDays + 2, 8);
      const ratedDate = completedAt(reportDays, 16);
      const score = SCORES[i % SCORES.length];
      const comment = COMMENTS[i % COMMENTS.length];

      const load = await prisma.load.create({
        data: {
          companyId: company.id,
          publishedBy: companyUser.id,
          origin,
          destination,
          pickupDate: loadDate,
          pickupWindow: "08:00 – 11:00",
          cargoType: i % 2 === 0 ? "PALLET" : "CONTAINER",
          weightKg: 1500 + (i % 5) * 600,
          volumeM3: 10 + (i % 4) * 3,
          requiredVehicle: "TRUCK",
          priceEur: 220 + (i % 4) * 90,
          priceNegotiable: true,
          notes: `Labelled freight, regular haul #${i + 1}.`,
          status: "COMPLETED",
          podUrl: `/pod/${spec.email.split("@")[0]}-load-${i + 1}.jpg`,
          podNote: "Signed proof of delivery uploaded.",
          createdAt: completedAt(reportDays + 6, 9),
        },
      });

      await prisma.application.create({
        data: {
          loadId: load.id,
          transporterId: carrier.id,
          status: "ACCEPTED",
          createdAt: completedAt(reportDays + 5, 10),
          updatedAt: completedAt(reportDays + 4, 12),
        },
      });

      await prisma.rating.create({
        data: {
          loadId: load.id,
          companyId: company.id,
          carrierId: carrier.id,
          score,
          comment,
          createdAt: ratedDate,
        },
      });

      created.push(`${origin} → ${destination}`);
    }

    const avgStr = avg(spec.loads);
    console.log(`  ${spec.email}: seeded ${created.length} completed loads with ratings. Avg ★ ${avgStr}`);
  }

  console.log('Carrier history seeded. View it as company@movr.dev under a load\'s candidate list.');
}

function avg(loads: number): string {
  const total = Array.from({ length: loads }, (_, i) => SCORES[i % SCORES.length]).reduce((a, b) => a + b, 0);
  return (total / loads).toFixed(1);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });