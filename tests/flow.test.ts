import "dotenv/config";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

let carrier: { id: string; email: string };
let companyProfile: { id: string };
let loadId: string;

before(async () => {
  const carrierUser = await prisma.user.findUniqueOrThrow({ where: { email: "carrier@movr.dev" } });
  const companyUser = await prisma.user.findUniqueOrThrow({ where: { email: "company@movr.dev" } });
  companyProfile = await prisma.company.findUniqueOrThrow({ where: { userId: companyUser.id } });
  carrier = { id: carrierUser.id, email: carrierUser.email };

  // Create a dedicated load for the test so we don't disturb demo data.
  const load = await prisma.load.create({
    data: {
      companyId: companyProfile.id,
      publishedBy: companyUser.id,
      origin: "Venlo",
      destination: "Venray",
      pickupDate: new Date(Date.now() + 24 * 3600 * 1000),
      cargoType: "PALLET",
      weightKg: 1000,
      status: "OPEN",
    },
  });
  loadId = load.id;
});

after(async () => {
  if (loadId) {
    await prisma.application.deleteMany({ where: { loadId } });
    await prisma.load.delete({ where: { id: loadId } });
  }
  await prisma.$disconnect();
});

test("apply -> select -> status progression", async () => {
  // Carrier applies (mirrors applyToLoad)
  const app = await prisma.application.create({
    data: { loadId, transporterId: carrier.id, status: "PENDING" },
  });
  assert.equal(app.status, "PENDING");

  // Duplicate apply must be prevented by the unique constraint
  await assert.rejects(
    prisma.application.create({ data: { loadId, transporterId: carrier.id, status: "PENDING" } }),
  );

  // Company selects (mirrors selectTransporter transaction)
  await prisma.$transaction([
    prisma.application.updateMany({ where: { loadId, status: "PENDING" }, data: { status: "REJECTED" } }),
    prisma.application.update({ where: { id: app.id }, data: { status: "SELECTED" } }),
    prisma.load.update({ where: { id: loadId }, data: { status: "SELECTED" } }),
  ]);

  const selectedApp = await prisma.application.findFirstOrThrow({ where: { loadId, status: "SELECTED" } });
  assert.equal(selectedApp.transporterId, carrier.id);
  const loadAfterSelect = await prisma.load.findUniqueOrThrow({ where: { id: loadId } });
  assert.equal(loadAfterSelect.status, "SELECTED");

  // Status progression (mirrors updateLoadStatus)
  for (const s of ["CONFIRMED", "IN_TRANSIT", "COMPLETED"]) {
    await prisma.load.update({
      where: { id: loadId },
      data: { status: s as "CONFIRMED" | "IN_TRANSIT" | "COMPLETED" },
    });
    const l = await prisma.load.findUniqueOrThrow({ where: { id: loadId } });
    assert.equal(l.status, s);
  }
});
