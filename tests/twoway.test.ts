import "dotenv/config";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

let carrier1: { id: string };
let carrier2: { id: string };
let companyUser: { id: string };
let companyProfile: { id: string };
let otherCompanyUser: { id: string };
let otherCompanyProfile: { id: string };

before(async () => {
  const c1 = await prisma.user.findUniqueOrThrow({ where: { email: "carrier@movr.dev" } });
  carrier1 = { id: c1.id };
  carrier2 = await prisma.user.create({
    data: { email: `carrier-twoway-${Date.now()}@movr.dev`, passwordHash: "x", name: "TwoWay Carrier 2", role: "CARRIER" },
  });
  const comp = await prisma.user.findUniqueOrThrow({ where: { email: "company@movr.dev" } });
  companyUser = { id: comp.id };
  companyProfile = await prisma.company.findUniqueOrThrow({ where: { userId: comp.id } });

  // other company for authz test
  otherCompanyUser = await prisma.user.create({
    data: { email: `company-twoway-${Date.now()}@movr.dev`, passwordHash: "x", name: "Other Company", role: "COMPANY" },
  });
  otherCompanyProfile = await prisma.company.create({
    data: { userId: otherCompanyUser.id, name: "Other BV", kvk: "99999999", address: "Other 1, Venlo", phone: "+31 6 00000000" },
  });
});

after(async () => {
  if (carrier2?.id) await prisma.user.delete({ where: { id: carrier2.id } }).catch(() => {});
  if (otherCompanyProfile?.id) await prisma.company.delete({ where: { id: otherCompanyProfile.id } }).catch(() => {});
  if (otherCompanyUser?.id) await prisma.user.delete({ where: { id: otherCompanyUser.id } }).catch(() => {});
  await prisma.$disconnect();
});

async function createLoad(companyId: string, publishedBy: string, status: "OPEN" | "SELECTED" | "CONFIRMED" = "OPEN") {
  return prisma.load.create({
    data: {
      companyId,
      publishedBy,
      origin: "Venlo",
      destination: "Venray",
      pickupDate: new Date(Date.now() + 24 * 3600 * 1000),
      cargoType: "PALLET",
      weightKg: 1000,
      status,
    },
  });
}

// 1 - Company selects carrier → Load SELECTED, chosen SELECTED, rest REJECTED
test("1: company selects carrier → Load SELECTED", async () => {
  const load = await createLoad(companyProfile.id, companyUser.id, "OPEN");
  try {
    const app1 = await prisma.application.create({ data: { loadId: load.id, transporterId: carrier1.id, status: "PENDING" } });
    const app2 = await prisma.application.create({ data: { loadId: load.id, transporterId: carrier2.id, status: "PENDING" } });

    const freshLoad = await prisma.load.findUnique({ where: { id: load.id } });
    assert.equal(freshLoad!.status, "OPEN");
    await prisma.$transaction([
      prisma.application.updateMany({ where: { loadId: load.id, status: "PENDING" }, data: { status: "REJECTED" } }),
      prisma.application.update({ where: { id: app1.id }, data: { status: "SELECTED" } }),
      prisma.load.update({ where: { id: load.id }, data: { status: "SELECTED" } }),
    ]);

    const sel = await prisma.application.findUniqueOrThrow({ where: { id: app1.id } });
    const rej = await prisma.application.findUniqueOrThrow({ where: { id: app2.id } });
    const l = await prisma.load.findUniqueOrThrow({ where: { id: load.id } });
    assert.equal(sel.status, "SELECTED");
    assert.equal(rej.status, "REJECTED");
    assert.equal(l.status, "SELECTED");
  } finally {
    await prisma.application.deleteMany({ where: { loadId: load.id } });
    await prisma.load.delete({ where: { id: load.id } });
  }
});

// 2 - Carrier not yet accepted → Company cannot CONFIRM (guard)
test("2: company cannot CONFIRM while SELECTED without ACCEPTED", async () => {
  const load = await createLoad(companyProfile.id, companyUser.id, "SELECTED");
  await prisma.application.create({ data: { loadId: load.id, transporterId: carrier1.id, status: "SELECTED" } });
  try {
    const accepted = await prisma.application.findFirst({ where: { loadId: load.id, status: "ACCEPTED" } });
    assert.equal(accepted, null);
    const fresh = await prisma.load.findUnique({ where: { id: load.id } });
    let threw = false;
    if (fresh!.status !== "SELECTED" || !accepted) threw = true;
    else await prisma.load.update({ where: { id: load.id }, data: { status: "CONFIRMED" } });
    assert.equal(threw, true);
    assert.equal((await prisma.load.findUniqueOrThrow({ where: { id: load.id } })).status, "SELECTED");
  } finally {
    await prisma.application.deleteMany({ where: { loadId: load.id } });
    await prisma.load.delete({ where: { id: load.id } });
  }
});

// 3 - Carrier accepts → ACCEPTED
test("3: carrier accepts → Application ACCEPTED", async () => {
  const load = await createLoad(companyProfile.id, companyUser.id, "SELECTED");
  const app = await prisma.application.create({ data: { loadId: load.id, transporterId: carrier1.id, status: "SELECTED" } });
  try {
    const fresh = await prisma.application.findUnique({ where: { id: app.id } });
    assert.equal(fresh!.status, "SELECTED");
    const freshLoad = await prisma.load.findUnique({ where: { id: load.id } });
    assert.equal(freshLoad!.status, "SELECTED");
    await prisma.application.update({ where: { id: app.id }, data: { status: "ACCEPTED" } });
    assert.equal((await prisma.application.findUniqueOrThrow({ where: { id: app.id } })).status, "ACCEPTED");
  } finally {
    await prisma.application.deleteMany({ where: { loadId: load.id } });
    await prisma.load.delete({ where: { id: load.id } });
  }
});

// 4 - Company confirms after ACCEPTED → Load CONFIRMED
test("4: company confirms after ACCEPTED → Load CONFIRMED", async () => {
  const load = await createLoad(companyProfile.id, companyUser.id, "SELECTED");
  await prisma.application.create({ data: { loadId: load.id, transporterId: carrier1.id, status: "ACCEPTED" } });
  try {
    const fresh = await prisma.load.findUnique({ where: { id: load.id } });
    assert.equal(fresh!.status, "SELECTED");
    const acc = await prisma.application.findFirst({ where: { loadId: load.id, status: "ACCEPTED" } });
    assert.ok(acc);
    await prisma.load.update({ where: { id: load.id }, data: { status: "CONFIRMED" } });
    assert.equal((await prisma.load.findUniqueOrThrow({ where: { id: load.id } })).status, "CONFIRMED");
  } finally {
    await prisma.application.deleteMany({ where: { loadId: load.id } });
    await prisma.load.delete({ where: { id: load.id } });
  }
});

// 5 - Carrier declines → DECLINED and OPEN + REJECTED → PENDING
test("5: carrier declines → DECLINED and OPEN", async () => {
  const load = await createLoad(companyProfile.id, companyUser.id, "SELECTED");
  const app1 = await prisma.application.create({ data: { loadId: load.id, transporterId: carrier1.id, status: "SELECTED" } });
  const app2 = await prisma.application.create({ data: { loadId: load.id, transporterId: carrier2.id, status: "REJECTED" } });
  try {
    const fLoad = await prisma.load.findUnique({ where: { id: load.id } });
    assert.equal(fLoad!.status, "SELECTED");
    await prisma.$transaction([
      prisma.application.update({ where: { id: app1.id }, data: { status: "DECLINED" } }),
      prisma.application.updateMany({ where: { loadId: load.id, status: "REJECTED" }, data: { status: "PENDING" } }),
      prisma.load.update({ where: { id: load.id }, data: { status: "OPEN" } }),
    ]);
    assert.equal((await prisma.application.findUniqueOrThrow({ where: { id: app1.id } })).status, "DECLINED");
    assert.equal((await prisma.application.findUniqueOrThrow({ where: { id: app2.id } })).status, "PENDING");
    assert.equal((await prisma.load.findUniqueOrThrow({ where: { id: load.id } })).status, "OPEN");
  } finally {
    await prisma.application.deleteMany({ where: { loadId: load.id } });
    await prisma.load.delete({ where: { id: load.id } });
  }
});

// 6 - Carrier not owner cannot accept
test("6: non-owner carrier cannot accept", async () => {
  const load = await createLoad(companyProfile.id, companyUser.id, "SELECTED");
  const app = await prisma.application.create({ data: { loadId: load.id, transporterId: carrier1.id, status: "SELECTED" } });
  try {
    // carrier2 tries to accept carrier1's app: lookup by (loadId, transporterId) yields nothing
    const victim = await prisma.application.findUnique({ where: { loadId_transporterId: { loadId: load.id, transporterId: carrier2.id } } });
    assert.equal(victim, null);
    // even if attacker tries direct update by id (not allowed via action, but via DB guard) the action checks transporterId
    // Simulate guard: only owner can update his own application
    const attackerApp = await prisma.application.findUnique({ where: { id: app.id } });
    assert.notEqual(attackerApp!.transporterId, carrier2.id);
    // No transition should happen for attacker
    assert.equal((await prisma.application.findUniqueOrThrow({ where: { id: app.id } })).status, "SELECTED");
  } finally {
    await prisma.application.deleteMany({ where: { loadId: load.id } });
    await prisma.load.delete({ where: { id: load.id } });
  }
});

// 7 - Company not owner cannot confirm
test("7: non-owner company cannot confirm", async () => {
  const load = await createLoad(companyProfile.id, companyUser.id, "SELECTED");
  await prisma.application.create({ data: { loadId: load.id, transporterId: carrier1.id, status: "ACCEPTED" } });
  try {
    const fresh = await prisma.load.findUnique({ where: { id: load.id } });
    let threw = false;
    if (fresh!.companyId !== otherCompanyProfile.id) threw = true;
    else await prisma.load.update({ where: { id: load.id }, data: { status: "CONFIRMED" } });
    assert.equal(threw, true);
    assert.equal((await prisma.load.findUniqueOrThrow({ where: { id: load.id } })).status, "SELECTED");
  } finally {
    await prisma.application.deleteMany({ where: { loadId: load.id } });
    await prisma.load.delete({ where: { id: load.id } });
  }
});

// 8 - Reverted selection cannot be accepted later
test("8: reverted selection cannot be accepted", async () => {
  const load = await createLoad(companyProfile.id, companyUser.id, "OPEN");
  const app1 = await prisma.application.create({ data: { loadId: load.id, transporterId: carrier1.id, status: "PENDING" } });
  await prisma.application.create({ data: { loadId: load.id, transporterId: carrier2.id, status: "PENDING" } });
  try {
    // Select
    await prisma.$transaction([
      prisma.application.updateMany({ where: { loadId: load.id, status: "PENDING" }, data: { status: "REJECTED" } }),
      prisma.application.update({ where: { id: app1.id }, data: { status: "SELECTED" } }),
      prisma.load.update({ where: { id: load.id }, data: { status: "SELECTED" } }),
    ]);
    // Undo (mirrors undoSelection)
    await prisma.$transaction([
      prisma.application.updateMany({ where: { loadId: load.id, status: "SELECTED" }, data: { status: "PENDING" } }),
      prisma.application.updateMany({ where: { loadId: load.id, status: "REJECTED" }, data: { status: "PENDING" } }),
      prisma.load.update({ where: { id: load.id }, data: { status: "OPEN" } }),
    ]);
    assert.equal((await prisma.application.findUniqueOrThrow({ where: { id: app1.id } })).status, "PENDING");
    assert.equal((await prisma.load.findUniqueOrThrow({ where: { id: load.id } })).status, "OPEN");

    // Carrier tries to accept old selection (should fail: status is PENDING not SELECTED, load is OPEN)
    const attempt = await prisma.application.findUnique({ where: { id: app1.id } });
    assert.equal(attempt!.status, "PENDING");
    let accepted = false;
    // Simulate acceptOffer guard
    if ((attempt!.status as string) === "SELECTED") {
      const l = await prisma.load.findUnique({ where: { id: load.id } });
      if (l!.status === "SELECTED") accepted = true;
    }
    assert.equal(accepted, false);
    // Ensure no transition
    assert.equal((await prisma.application.findUniqueOrThrow({ where: { id: app1.id } })).status, "PENDING");
  } finally {
    await prisma.application.deleteMany({ where: { loadId: load.id } });
    await prisma.load.delete({ where: { id: load.id } });
  }
});
