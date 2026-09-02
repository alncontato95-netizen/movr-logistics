import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("movrdemo123", 10);

  // Demo carrier
  await prisma.user.upsert({
    where: { email: "carrier@movr.dev" },
    update: { phone: "+31 6 12345678", vehiclePlate: "01-VLN-2", professionalLicense: "2462LK123" },
    create: {
      email: "carrier@movr.dev",
      passwordHash,
      name: "Jan van der Berg",
      phone: "+31 6 12345678",
      role: "CARRIER",
      vehicleType: "TRUCK",
      vehiclePlate: "01-VLN-2",
      professionalLicense: "2462LK123",
      currentRegion: "Venlo",
      acceptsRegions: JSON.stringify(["Venlo", "Venray", "Roermond", "Weert", "Helmond", "Eindhoven"]),
      available: true,
    },
  });

  // Demo company
  let company = await prisma.user.findUnique({ where: { email: "company@movr.dev" } });
  let companyProfile: { id: string } | null = null;
  if (!company) {
    company = await prisma.user.create({
      data: { email: "company@movr.dev", passwordHash, name: "Lisa Willems", role: "COMPANY" },
    });
    companyProfile = await prisma.company.create({
      data: {
        userId: company.id,
        name: "Willems Transport B.V.",
        kvk: "12345678",
        address: "Trade Port West 12, Venlo",
        phone: "+31 6 12345678",
      },
    });
  } else {
    companyProfile = await prisma.company.findUnique({ where: { userId: company.id } });
  }

  // Demo loads from the demo company
  const existingLoads = await prisma.load.count({ where: { companyId: companyProfile!.id } });
  if (existingLoads === 0) {
    const now = new Date();
    const loads = [
      {
        origin: "Venlo",
        destination: "Eindhoven",
        pickupDate: addDays(now, 2),
        pickupWindow: "08:00 – 11:00",
        cargoType: "PALLET" as const,
        weightKg: 1800,
        volumeM3: 14,
        requiredVehicle: "TRUCK" as const,
        priceEur: 320,
        priceNegotiable: true,
        notes: "5 pallets, forklift available at load.",
      },
      {
        origin: "Roermond",
        destination: "Helmond",
        pickupDate: addDays(now, 3),
        pickupWindow: "14:00 – 17:00",
        cargoType: "CONTAINER" as const,
        weightKg: 6400,
        volumeM3: 20,
        requiredVehicle: "TRUCK" as const,
        priceEur: 480,
        priceNegotiable: true,
        notes: "1x 20ft container.",
      },
      {
        origin: "Venray",
        destination: "Tilburg",
        pickupDate: addDays(now, 5),
        pickupWindow: "08:00 – 12:00",
        cargoType: "BULK" as const,
        weightKg: 9000,
        volumeM3: null,
        requiredVehicle: "TRACTOR_TRAILER" as const,
        priceEur: 780,
        priceNegotiable: false,
        notes: "Loose load, tarped.",
      },
      {
        origin: "Weert",
        destination: "Venlo",
        pickupDate: addDays(now, 1),
        pickupWindow: "09:00 – 13:00",
        cargoType: "OTHER" as const,
        weightKg: 800,
        volumeM3: 6,
        requiredVehicle: null,
        priceEur: 150,
        priceNegotiable: true,
        notes: "Small mixed shipment, easy handling.",
      },
    ];

    for (const l of loads) {
      await prisma.load.create({
        data: {
          companyId: companyProfile!.id,
          publishedBy: company!.id,
          ...l,
        },
      });
    }
  }

  console.log("Seeded demo carrier & company accounts.");
  console.log("  carrier: carrier@movr.dev / movrdemo123");
  console.log("  company: company@movr.dev / movrdemo123");
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
