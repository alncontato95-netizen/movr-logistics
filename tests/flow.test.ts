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
  for (const s of ["CONFIRMED", "PICKED_UP", "DELIVERED", "COMPLETED"]) {
    await prisma.load.update({
      where: { id: loadId },
      data: { status: s as "CONFIRMED" | "PICKED_UP" | "DELIVERED" | "COMPLETED" },
    });
    const l = await prisma.load.findUniqueOrThrow({ where: { id: loadId } });
    assert.equal(l.status, s);
  }
});

test("carrier accepts the offer before the booking is confirmed", async () => {
  const load = await prisma.load.create({
    data: {
      companyId: companyProfile.id,
      publishedBy: carrier.id,
      origin: "Venlo",
      destination: "Weert",
      pickupDate: new Date(Date.now() + 24 * 3600 * 1000),
      cargoType: "PALLET",
      weightKg: 1100,
      status: "OPEN",
    },
  });

  try {
    // Carrier applies and company selects (mirrors selectTransporter)
    const app = await prisma.application.create({
      data: { loadId: load.id, transporterId: carrier.id, status: "SELECTED" },
    });
    await prisma.load.update({ where: { id: load.id }, data: { status: "SELECTED" } });

    // Carrier accepts the offer (mirrors acceptOffer)
    await prisma.application.update({
      where: { id: app.id },
      data: { status: "ACCEPTED" },
    });

    const accepted = await prisma.application.findFirstOrThrow({
      where: { loadId: load.id, status: "ACCEPTED" },
    });
    assert.equal(accepted.transporterId, carrier.id);

    // Company confirms: there is an ACCEPTED application, so CONFIRMED is allowed.
    const hasAccepted = await prisma.application.findFirst({ where: { loadId: load.id, status: "ACCEPTED" } });
    assert.ok(hasAccepted);
    await prisma.load.update({ where: { id: load.id }, data: { status: "CONFIRMED" } });
    assert.equal((await prisma.load.findUniqueOrThrow({ where: { id: load.id } })).status, "CONFIRMED");
  } finally {
    await prisma.application.deleteMany({ where: { loadId: load.id } });
    await prisma.load.delete({ where: { id: load.id } });
  }
});

test("full carrier-driven flow: accept -> confirm -> pickup -> delivery -> completed", async () => {
  const load = await prisma.load.create({
    data: {
      companyId: companyProfile.id,
      publishedBy: carrier.id,
      origin: "Eindhoven",
      destination: "Rotterdam",
      pickupDate: new Date(Date.now() + 24 * 3600 * 1000),
      cargoType: "PALLET",
      weightKg: 2000,
      status: "OPEN",
    },
  });

  try {
    // Carrier applies and company selects (mirrors selectTransporter)
    const app = await prisma.application.create({
      data: { loadId: load.id, transporterId: carrier.id, status: "PENDING" },
    });
    await prisma.$transaction([
      prisma.application.update({ where: { id: app.id }, data: { status: "SELECTED" } }),
      prisma.load.update({ where: { id: load.id }, data: { status: "SELECTED" } }),
    ]);

    // Carrier accepts the offer (mirrors acceptOffer)
    await prisma.application.update({ where: { id: app.id }, data: { status: "ACCEPTED" } });
    assert.equal((await prisma.application.findFirstOrThrow({ where: { loadId: load.id } })).status, "ACCEPTED");

    // Company confirms booking (mirrors updateLoadStatus with ACCEPTED guard)
    await prisma.load.update({ where: { id: load.id }, data: { status: "CONFIRMED" } });
    assert.equal((await prisma.load.findUniqueOrThrow({ where: { id: load.id } })).status, "CONFIRMED");

    // Carrier confirms pickup (mirrors confirmPickup)
    const loadBeforePickup = await prisma.load.findUniqueOrThrow({ where: { id: load.id } });
    assert.equal(loadBeforePickup.status, "CONFIRMED");
    await prisma.load.update({ where: { id: load.id }, data: { status: "PICKED_UP" } });
    assert.equal((await prisma.load.findUniqueOrThrow({ where: { id: load.id } })).status, "PICKED_UP");

    // Carrier confirms delivery (mirrors confirmDelivery)
    const loadBeforeDelivery = await prisma.load.findUniqueOrThrow({ where: { id: load.id } });
    assert.equal(loadBeforeDelivery.status, "PICKED_UP");
    await prisma.load.update({ where: { id: load.id }, data: { status: "DELIVERED" } });
    assert.equal((await prisma.load.findUniqueOrThrow({ where: { id: load.id } })).status, "DELIVERED");

    // Company marks completed (mirrors updateLoadStatus)
    await prisma.load.update({ where: { id: load.id }, data: { status: "COMPLETED" } });
    assert.equal((await prisma.load.findUniqueOrThrow({ where: { id: load.id } })).status, "COMPLETED");
  } finally {
    await prisma.application.deleteMany({ where: { loadId: load.id } });
    await prisma.load.delete({ where: { id: load.id } });
  }
});

test("carrier declining the offer reopens the load for other candidates", async () => {
  const load = await prisma.load.create({
    data: {
      companyId: companyProfile.id,
      publishedBy: carrier.id,
      origin: "Venlo",
      destination: "Helmond",
      pickupDate: new Date(Date.now() + 24 * 3600 * 1000),
      cargoType: "PALLET",
      weightKg: 900,
      status: "OPEN",
    },
  });

  try {
    // A second candidate so one is selected and the other ends up pending again.
    const carrier2 = await prisma.user.create({
      data: {
        email: `carrier-decline-${Date.now()}@movr.dev`,
        passwordHash: "x",
        name: "Decline Carrier",
        role: "CARRIER",
      },
    });

    // Both candidates apply, the first is selected (mirrors selectTransporter).
    const app1 = await prisma.application.create({
      data: { loadId: load.id, transporterId: carrier.id, status: "PENDING" },
    });
    const app2 = await prisma.application.create({
      data: { loadId: load.id, transporterId: carrier2.id, status: "PENDING" },
    });
    await prisma.$transaction([
      prisma.application.updateMany({ where: { loadId: load.id, status: "PENDING" }, data: { status: "REJECTED" } }),
      prisma.application.update({ where: { id: app1.id }, data: { status: "SELECTED" } }),
      prisma.load.update({ where: { id: load.id }, data: { status: "SELECTED" } }),
    ]);
    await prisma.application.update({ where: { id: app2.id }, data: { status: "REJECTED" } });

    // Selected carrier declines the offer (mirrors declineOffer transaction).
    await prisma.$transaction([
      prisma.application.update({ where: { id: app1.id }, data: { status: "DECLINED" } }),
      prisma.application.updateMany({ where: { loadId: load.id, status: "REJECTED" }, data: { status: "PENDING" } }),
      prisma.load.update({ where: { id: load.id }, data: { status: "OPEN" } }),
    ]);

    const loadAfter = await prisma.load.findUniqueOrThrow({ where: { id: load.id } });
    assert.equal(loadAfter.status, "OPEN");
    assert.equal(await prisma.application.count({ where: { loadId: load.id, status: "DECLINED" } }), 1);
    assert.equal(await prisma.application.count({ where: { loadId: load.id, status: "PENDING" } }), 1);

    await prisma.user.delete({ where: { id: carrier2.id } });
  } finally {
    await prisma.application.deleteMany({ where: { loadId: load.id } });
    await prisma.load.delete({ where: { id: load.id } });
  }
});

test("undo selection reverts load and applications to OPEN/PENDING", async () => {
  // A second transporter so one application is selected and the other rejected.
  const carrier2 = await prisma.user.create({
    data: {
      email: `carrier-undo-${Date.now()}@movr.dev`,
      passwordHash: "x",
      name: "Test Carrier Two",
      role: "CARRIER",
    },
  });

  const load = await prisma.load.create({
    data: {
      companyId: companyProfile.id,
      publishedBy: carrier.id,
      origin: "Venlo",
      destination: "Roermond",
      pickupDate: new Date(Date.now() + 24 * 3600 * 1000),
      cargoType: "PALLET",
      weightKg: 1200,
      status: "OPEN",
    },
  });

  try {
    // Two carriers apply (mirrors applyToLoad)
    const app1 = await prisma.application.create({
      data: { loadId: load.id, transporterId: carrier.id, status: "PENDING" },
    });
    await prisma.application.create({
      data: { loadId: load.id, transporterId: carrier2.id, status: "PENDING" },
    });

    // Company selects carrier (mirrors selectTransporter)
    await prisma.$transaction([
      prisma.application.updateMany({ where: { loadId: load.id, status: "PENDING" }, data: { status: "REJECTED" } }),
      prisma.application.update({ where: { id: app1.id }, data: { status: "SELECTED" } }),
      prisma.load.update({ where: { id: load.id }, data: { status: "SELECTED" } }),
    ]);

    const selected = await prisma.application.findFirstOrThrow({ where: { loadId: load.id, status: "SELECTED" } });
    assert.equal(selected.transporterId, carrier.id);
    assert.equal((await prisma.application.count({ where: { loadId: load.id, status: "REJECTED" } })), 1);

    // Undo selection (mirrors undoSelection transaction)
    await prisma.$transaction([
      prisma.application.updateMany({ where: { loadId: load.id, status: "SELECTED" }, data: { status: "PENDING" } }),
      prisma.application.updateMany({ where: { loadId: load.id, status: "REJECTED" }, data: { status: "PENDING" } }),
      prisma.load.update({ where: { id: load.id }, data: { status: "OPEN" } }),
    ]);

    const loadAfterUndo = await prisma.load.findUniqueOrThrow({ where: { id: load.id } });
    assert.equal(loadAfterUndo.status, "OPEN");
    assert.equal(await prisma.application.count({ where: { loadId: load.id, status: "PENDING" } }), 2);
    assert.equal(await prisma.application.count({ where: { loadId: load.id, status: "SELECTED" } }), 0);
    assert.equal(await prisma.application.count({ where: { loadId: load.id, status: "REJECTED" } }), 0);
  } finally {
    await prisma.application.deleteMany({ where: { loadId: load.id } });
    await prisma.load.delete({ where: { id: load.id } });
    await prisma.user.delete({ where: { id: carrier2.id } });
  }
});

test("notifications: created for the recipient, unread count, and mark-all-read", async () => {
  // Mirror createNotification helpers directly against the Notification model.
  const load = await prisma.load.create({
    data: {
      companyId: companyProfile.id,
      publishedBy: carrier.id,
      origin: "Venlo",
      destination: "Breda",
      pickupDate: new Date(Date.now() + 24 * 3600 * 1000),
      cargoType: "PALLET",
      weightKg: 1300,
      status: "OPEN",
    },
  });

  try {
    // Two notifications for the same recipient (the company user / publisher).
    const company = await prisma.user.findUniqueOrThrow({ where: { email: "company@movr.dev" } });
    await prisma.notification.create({
      data: { userId: company.id, loadId: load.id, type: "APPLICATION", message: "interest" },
    });
    await prisma.notification.create({
      data: { userId: company.id, loadId: load.id, type: "PICKED_UP", message: "picked up" },
    });

    // unreadCount semantics used by the bell badge.
    const unread = await prisma.notification.count({
      where: { userId: company.id, read: false },
    });
    assert.equal(unread, 2);

    // Only notifications for this load's recipient exist; the carrier (opener) has none.
    assert.equal(await prisma.notification.count({ where: { userId: carrier.id } }), 0);

    // markAllRead semantics used by the notifications page.
    await prisma.notification.updateMany({
      where: { userId: company.id, read: false },
      data: { read: true },
    });
    assert.equal(
      await prisma.notification.count({ where: { userId: company.id, read: false } }),
      0,
    );
    assert.equal(
      await prisma.notification.count({ where: { userId: company.id, read: true } }),
      2,
    );
  } finally {
    await prisma.notification.deleteMany({ where: { loadId: load.id } });
    await prisma.load.delete({ where: { id: load.id } });
  }
});
