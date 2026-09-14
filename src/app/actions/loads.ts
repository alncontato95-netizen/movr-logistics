"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { loadSchema } from "@/lib/validation";
import { createNotification } from "@/lib/notify";
import { isCompatible } from "@/lib/matching";
import { canConfirmPickup } from "@/lib/schedule";
import { rateLimit } from "@/lib/rate-limit";
import { createAuditEvent } from "@/lib/audit";

export type LoadState = { errors?: Record<string, string[] | undefined>; message?: string } | undefined;

export async function createLoad(_state: LoadState, formData: FormData): Promise<LoadState> {
  const user = await getCurrentUser();
  if (user.role !== "COMPANY") redirect("/login");

  const rateLimitResult = await rateLimit(`company_${user.id}`, { max: 10, windowMs: 60 * 1000 });
  if (!rateLimitResult.ok) {
    return { message: "Too many requests. Please wait a moment before creating another load." };
  }

  const parsed = loadSchema.safeParse({
    origin: formData.get("origin"),
    destination: formData.get("destination"),
    pickupDate: formData.get("pickupDate"),
    pickupWindow: formData.get("pickupWindow") || undefined,
    cargoType: formData.get("cargoType"),
    weightKg: formData.get("weightKg"),
    volumeM3: formData.get("volumeM3") || undefined,
    requiredVehicle: formData.get("requiredVehicle") || undefined,
    priceEur: formData.get("priceEur") || undefined,
    priceNegotiable: formData.get("priceNegotiable") === "on",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const company = await prisma.company.findUnique({ where: { userId: user.id } });
  if (!company) {
    return { message: "Please save your business details before publishing a load." };
  }
  if (!company.verified) {
    return { message: "Your company is pending verification. We'll approve it manually and let you know." };
  }

  const data = parsed.data;
  const load = await prisma.$transaction(async (tx) => {
    const created = await tx.load.create({
      data: {
        companyId: company.id,
        publishedBy: user.id,
        origin: data.origin,
        destination: data.destination,
        pickupDate: new Date(data.pickupDate),
        pickupWindow: data.pickupWindow,
        cargoType: data.cargoType,
        weightKg: data.weightKg,
        volumeM3: data.volumeM3,
        requiredVehicle: data.requiredVehicle,
        priceEur: data.priceEur,
        priceNegotiable: data.priceNegotiable,
        notes: data.notes,
      },
    });
    await createAuditEvent(tx, {
      entityType: "Load",
      entityId: created.id,
      eventType: "LOAD_CREATED",
      actorUserId: user.id,
      metadata: { newStatus: created.status },
    });
    return created;
  });

  // Notify compatible carriers (fire-and-forget, non-blocking, ignore failures)
  void (async () => {
    try {
      const carriers = await prisma.user.findMany({
        where: { role: "CARRIER", available: true },
      });
      for (const carrier of carriers) {
        if (isCompatible(carrier as never, load)) {
          void createNotification({
            userId: carrier.id,
            loadId: load.id,
            type: "NEW_LOAD",
            message: `New load available: ${load.origin} → ${load.destination}`,
          }).catch(() => {});
        }
      }
    } catch {}
  })();

  revalidatePath("/company/loads");
  redirect(`/company/loads/${load.id}`);
}

export async function updateLoad(_state: LoadState, formData: FormData): Promise<LoadState> {
  const user = await getCurrentUser();
  if (user.role !== "COMPANY") redirect("/login");

  const rateLimitResult = await rateLimit(`company_${user.id}_load`, { max: 20, windowMs: 60 * 1000 });
  if (!rateLimitResult.ok) {
    return { message: "Too many requests. Please wait before updating loads." };
  }

  const loadId = formData.get("loadId") as string;
  if (!loadId) return { message: "Missing load." };

  const company = await prisma.company.findUnique({ where: { userId: user.id } });
  if (!company) return { message: "Please save your business details before publishing a load." };

  const existing = await prisma.load.findUnique({ where: { id: loadId } });
  if (!existing || existing.companyId !== company.id) redirect("/company/loads");
  if (existing.status !== "OPEN") return { message: "This load can no longer be edited." };

  const parsed = loadSchema.safeParse({
    origin: formData.get("origin"),
    destination: formData.get("destination"),
    pickupDate: formData.get("pickupDate"),
    pickupWindow: formData.get("pickupWindow") || undefined,
    cargoType: formData.get("cargoType"),
    weightKg: formData.get("weightKg"),
    volumeM3: formData.get("volumeM3") || undefined,
    requiredVehicle: formData.get("requiredVehicle") || undefined,
    priceEur: formData.get("priceEur") || undefined,
    priceNegotiable: formData.get("priceNegotiable") === "on",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  await prisma.load.update({
    where: { id: loadId },
    data: {
      origin: data.origin,
      destination: data.destination,
      pickupDate: new Date(data.pickupDate),
      pickupWindow: data.pickupWindow,
      cargoType: data.cargoType,
      weightKg: data.weightKg,
      volumeM3: data.volumeM3,
      requiredVehicle: data.requiredVehicle,
      priceEur: data.priceEur,
      priceNegotiable: data.priceNegotiable,
      notes: data.notes,
    },
  });

  revalidatePath("/company/loads");
  revalidatePath(`/company/loads/${loadId}`);
  redirect(`/company/loads/${loadId}?updated=1`);
}

export async function applyToLoad(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "CARRIER") redirect("/login");

  const rateLimitResult = await rateLimit(`carrier_${user.id}`, { max: 15, windowMs: 60 * 1000 });
  if (!rateLimitResult.ok) {
    redirect("/loads?rate-limited=1");
  }

  const loadId = formData.get("loadId") as string;
  if (!loadId || typeof loadId !== "string" || loadId.length < 10) redirect("/loads");
  const load = await prisma.load.findUnique({ where: { id: loadId } });
  if (!load || load.status !== "OPEN") redirect("/loads");
  if (load.pickupDate.getTime() < Date.now()) redirect("/loads");
  if (!isCompatible(user as never, load)) redirect("/loads");

  const existing = await prisma.application.findUnique({
    where: { loadId_transporterId: { loadId, transporterId: user.id } },
  });
  let shouldNotify = false;
  if (!existing) {
    try {
      await prisma.application.create({
        data: { loadId, transporterId: user.id, status: "PENDING" },
      });
      shouldNotify = true;
    } catch {
      // unique constraint race — already applied
    }
  } else if (existing.status === "DECLINED" || existing.status === "CANCELLED" || existing.status === "REJECTED") {
    await prisma.application.update({
      where: { id: existing.id },
      data: { status: "PENDING" },
    });
    shouldNotify = true;
  } else {
    // PENDING, SELECTED, ACCEPTED — already active, do nothing
    shouldNotify = false;
  }

  if (shouldNotify) {
    await createNotification({
      userId: load.publishedBy,
      loadId,
      type: "APPLICATION",
      message: `${user.name} expressed interest in your load ${load.origin} → ${load.destination}.`,
    }).catch(() => {});
  }

  revalidatePath(`/loads/${loadId}`);
  redirect(`/loads/${loadId}?applied=1`);
}

export async function cancelApplication(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "CARRIER") redirect("/login");

  const loadId = formData.get("loadId") as string;
  const existing = await prisma.application.findUnique({
    where: { loadId_transporterId: { loadId, transporterId: user.id } },
  });
  if (existing && existing.status === "PENDING") {
    await prisma.application.update({
      where: { id: existing.id },
      data: { status: "CANCELLED" },
    });
  }

  revalidatePath(`/loads/${loadId}`);
  revalidatePath("/applications");
  redirect(`/loads/${loadId}`);
}

export async function acceptOffer(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "CARRIER") redirect("/login");

  const loadId = formData.get("loadId") as string;
  if (!loadId) redirect("/loads");
  const load = await prisma.load.findUnique({ where: { id: loadId } });
  if (!load || load.status !== "SELECTED") redirect(`/loads/${loadId}`);
  const existing = await prisma.application.findUnique({
    where: { loadId_transporterId: { loadId, transporterId: user.id } },
  });
  if (existing && existing.status === "SELECTED" && load) {
    await prisma.$transaction(async (tx) => {
      const fresh = await tx.application.findUnique({ where: { id: existing.id } });
      if (!fresh || fresh.status !== "SELECTED") return;
      const freshLoad = await tx.load.findUnique({ where: { id: loadId } });
      if (!freshLoad || freshLoad.status !== "SELECTED") return;
      await tx.application.update({
        where: { id: existing.id },
        data: { status: "ACCEPTED" },
      });
    });
    await createNotification({
      userId: load.publishedBy,
      loadId,
      type: "ACCEPTED",
      message: `${user.name} accepted your offer for ${load.origin} → ${load.destination}. You can confirm the booking.`,
    }).catch(() => {});
  }

  revalidatePath(`/loads/${loadId}`);
  revalidatePath("/applications");
  redirect(`/loads/${loadId}?accepted=1`);
}

export async function declineOffer(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "CARRIER") redirect("/login");

  const loadId = formData.get("loadId") as string;
  if (!loadId) redirect("/loads");
  const load = await prisma.load.findUnique({ where: { id: loadId } });
  if (!load || load.status !== "SELECTED") redirect(`/loads/${loadId}`);
  const existing = await prisma.application.findUnique({
    where: { loadId_transporterId: { loadId, transporterId: user.id } },
  });
  if (!existing || existing.status !== "SELECTED") redirect(`/loads/${loadId}`);

  await prisma.$transaction(async (tx) => {
    const freshLoad = await tx.load.findUnique({ where: { id: loadId } });
    if (!freshLoad || freshLoad.status !== "SELECTED") return;
    const freshApp = await tx.application.findUnique({ where: { id: existing.id } });
    if (!freshApp || freshApp.status !== "SELECTED") return;
    await tx.application.update({
      where: { id: existing.id },
      data: { status: "DECLINED" },
    });
    await tx.application.updateMany({
      where: { loadId, status: "REJECTED" },
      data: { status: "PENDING" },
    });
    await tx.load.update({
      where: { id: loadId },
      data: { status: "OPEN" },
    });
    await createAuditEvent(tx, {
      entityType: "Load",
      entityId: loadId,
      eventType: "OFFER_DECLINED",
      actorUserId: user.id,
      metadata: { previousStatus: "SELECTED", newStatus: "OPEN", applicationId: existing.id },
    });
  });

  if (load) {
    await createNotification({
      userId: load.publishedBy,
      loadId,
      type: "DECLINED",
      message: `${user.name} declined the offer for ${load.origin} → ${load.destination}. The load is open again.`,
    }).catch(() => {});
  }

  revalidatePath(`/loads/${loadId}`);
  revalidatePath("/applications");
  revalidatePath(`/company/loads/${loadId}`);
  redirect(`/loads/${loadId}?declined=1`);
}

export async function confirmPickup(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "CARRIER") redirect("/login");

  const loadId = formData.get("loadId") as string;
  const load = await prisma.load.findUnique({ where: { id: loadId } });
  if (!load || load.status !== "CONFIRMED") redirect(`/loads/${loadId}`);

  const existing = await prisma.application.findUnique({
    where: { loadId_transporterId: { loadId, transporterId: user.id } },
  });
  if (!existing || existing.status !== "ACCEPTED") redirect(`/loads/${loadId}`);

  // A service can only be executed from the scheduled pickup time onward.
  if (!canConfirmPickup(load.pickupDate, load.pickupWindow)) redirect(`/loads/${loadId}?early-pickup=1`);

  await prisma.$transaction(async (tx) => {
    await tx.load.update({ where: { id: loadId }, data: { status: "PICKED_UP" } });
    await createAuditEvent(tx, {
      entityType: "Load",
      entityId: loadId,
      eventType: "PICKUP_CONFIRMED",
      actorUserId: user.id,
      metadata: { previousStatus: "CONFIRMED", newStatus: "PICKED_UP" },
    });
  });

  await createNotification({
    userId: load.publishedBy,
    loadId,
    type: "PICKED_UP",
    message: `${user.name} picked up the load ${load.origin} → ${load.destination}. It is now in transit.`,
  }).catch(() => {});

  revalidatePath(`/loads/${loadId}`);
  revalidatePath(`/company/loads/${loadId}`);
  redirect(`/loads/${loadId}?picked-up=1`);
}

export async function confirmDelivery(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "CARRIER") redirect("/login");

  const loadId = formData.get("loadId") as string;
  const load = await prisma.load.findUnique({ where: { id: loadId } });
  if (!load || load.status !== "PICKED_UP") redirect(`/loads/${loadId}`);

  const existing = await prisma.application.findUnique({
    where: { loadId_transporterId: { loadId, transporterId: user.id } },
  });
  if (!existing || existing.status !== "ACCEPTED") redirect(`/loads/${loadId}`);

  // A service can only be executed from the scheduled pickup time onward.
  if (!canConfirmPickup(load.pickupDate, load.pickupWindow)) redirect(`/loads/${loadId}?early-pickup=1`);

  await prisma.$transaction(async (tx) => {
    await tx.load.update({ where: { id: loadId }, data: { status: "DELIVERED" } });
    await createAuditEvent(tx, {
      entityType: "Load",
      entityId: loadId,
      eventType: "DELIVERY_CONFIRMED",
      actorUserId: user.id,
      metadata: { previousStatus: "PICKED_UP", newStatus: "DELIVERED" },
    });
  });

  await createNotification({
    userId: load.publishedBy,
    loadId,
    type: "DELIVERED",
    message: `${user.name} delivered the load ${load.origin} → ${load.destination}. You can mark the booking as complete.`,
  }).catch(() => {});

  revalidatePath(`/loads/${loadId}`);
  revalidatePath(`/company/loads/${loadId}`);
  redirect(`/loads/${loadId}?delivered=1`);
}

export async function selectTransporter(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "COMPANY") redirect("/login");

  const loadId = formData.get("loadId") as string;
  const applicationId = formData.get("applicationId") as string;
  if (!loadId || !applicationId) redirect("/company/loads");

  const company = await prisma.company.findUnique({ where: { userId: user.id } });
  if (!company) redirect("/company/loads");

  const application = await prisma.application.findUnique({
    where: { id: applicationId, loadId },
    include: { transporter: true },
  });
  if (!application || application.status !== "PENDING") redirect(`/company/loads/${loadId}`);

  try {
    await prisma.$transaction(async (tx) => {
      const freshLoad = await tx.load.findUnique({ where: { id: loadId } });
      if (!freshLoad || freshLoad.companyId !== company.id || freshLoad.status !== "OPEN") throw new Error("Invalid load state");
      const alreadySelected = await tx.application.findFirst({ where: { loadId, status: "SELECTED" } });
      if (alreadySelected) throw new Error("Already selected");
      const freshApp = await tx.application.findUnique({ where: { id: application.id } });
      if (!freshApp || freshApp.status !== "PENDING") throw new Error("Invalid application");
      await tx.application.updateMany({
        where: { loadId, status: "PENDING" },
        data: { status: "REJECTED" },
      });
      await tx.application.update({
        where: { id: application.id },
        data: { status: "SELECTED" },
      });
      await tx.load.update({
        where: { id: loadId },
        data: { status: "SELECTED" },
      });
      await createAuditEvent(tx, {
        entityType: "Load",
        entityId: loadId,
        eventType: "CARRIER_SELECTED",
        actorUserId: user.id,
        metadata: { previousStatus: "OPEN", newStatus: "SELECTED", carrierUserId: application.transporterId },
      });
    });
  } catch {
    redirect(`/company/loads/${loadId}`);
  }

  const load = await prisma.load.findUnique({ where: { id: loadId } });
  if (load) {
    await createNotification({
      userId: application.transporterId,
      loadId,
      type: "SELECTED",
      message: `${company.name} selected you for the load ${load.origin} → ${load.destination}. Review the offer and accept or decline it.`,
    }).catch(() => {});
  }

  revalidatePath(`/company/loads/${loadId}`);
  revalidatePath("/company/loads");
  redirect(`/company/loads/${loadId}?selected=1`);
}

export async function undoSelection(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "COMPANY") redirect("/login");

  const loadId = formData.get("loadId") as string;
  if (!loadId) redirect("/company/loads");

  const company = await prisma.company.findUnique({ where: { userId: user.id } });
  if (!company) redirect("/company/loads");

  try {
    await prisma.$transaction(async (tx) => {
      const freshLoad = await tx.load.findUnique({ where: { id: loadId } });
      if (!freshLoad || freshLoad.companyId !== company.id || freshLoad.status !== "SELECTED") throw new Error("Invalid state");
      const hasSelected = await tx.application.findFirst({ where: { loadId, status: "SELECTED" } });
      if (!hasSelected) throw new Error("No selection");
      // Only a load that is reserved (carrier selected) but not yet confirmed can be undone.
      const hasAccepted = await tx.application.findFirst({ where: { loadId, status: "ACCEPTED" } });
      if (hasAccepted) throw new Error("Already accepted");
      await tx.application.updateMany({
        where: { loadId, status: "SELECTED" },
        data: { status: "PENDING" },
      });
      await tx.application.updateMany({
        where: { loadId, status: "REJECTED" },
        data: { status: "PENDING" },
      });
      await tx.load.update({
        where: { id: loadId },
        data: { status: "OPEN" },
      });
      await createAuditEvent(tx, {
        entityType: "Load",
        entityId: loadId,
        eventType: "SELECTION_UNDONE",
        actorUserId: user.id,
        metadata: { previousStatus: "SELECTED", newStatus: "OPEN" },
      });
    });
  } catch {
    redirect(`/company/loads/${loadId}`);
  }

  revalidatePath(`/company/loads/${loadId}`);
  revalidatePath("/company/loads");
  redirect(`/company/loads/${loadId}?undone=1`);
}

export async function cancelLoad(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "COMPANY") redirect("/login");

  const loadId = formData.get("loadId") as string;
  if (!loadId) redirect("/company/loads");

  const company = await prisma.company.findUnique({ where: { userId: user.id } });
  if (!company) redirect("/company/loads");

  const load = await prisma.load.findUnique({ where: { id: loadId } });
  if (!load || load.companyId !== company.id) redirect("/company/loads");

  if (load.status !== "OPEN" && load.status !== "SELECTED") {
    revalidatePath(`/company/loads/${loadId}`);
    redirect(`/company/loads/${loadId}`);
  }

  let selectedApp: { transporterId: string } | null = null;
  if (load.status === "SELECTED") {
    selectedApp = await prisma.application.findFirst({
      where: { loadId, status: "SELECTED" },
      select: { transporterId: true },
    });
  }

  await prisma.$transaction(async (tx) => {
    const fresh = await tx.load.findUnique({ where: { id: loadId } });
    if (!fresh || fresh.companyId !== company.id) throw new Error("Invalid load");
    if (fresh.status !== "OPEN" && fresh.status !== "SELECTED") throw new Error("Cannot cancel");
    await tx.application.updateMany({
      where: { loadId, status: { in: ["PENDING", "SELECTED"] as const } },
      data: { status: "CANCELLED" },
    });
    await tx.load.update({ where: { id: loadId }, data: { status: "CANCELLED" } });
    await createAuditEvent(tx, {
      entityType: "Load",
      entityId: loadId,
      eventType: "LOAD_CANCELLED",
      actorUserId: user.id,
      metadata: { previousStatus: fresh.status, newStatus: "CANCELLED" },
    });
  });

  if (selectedApp) {
    await createNotification({
      userId: selectedApp.transporterId,
      loadId,
      type: "CANCELLED",
      message: `${company.name} cancelled the load ${load.origin} → ${load.destination}.`,
    }).catch(() => {});
  }

  revalidatePath("/company/loads");
  revalidatePath(`/company/loads/${loadId}`);
  redirect("/company/loads?cancelled=1");
}

export async function duplicateLoad(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "COMPANY") redirect("/login");
  const loadId = formData.get("loadId") as string;
  if (!loadId) redirect("/company/loads");
  const company = await prisma.company.findUnique({ where: { userId: user.id } });
  if (!company) redirect("/company/loads");
  const orig = await prisma.load.findUnique({ where: { id: loadId } });
  if (!orig || orig.companyId !== company.id) redirect("/company/loads");
  if (!company.verified) redirect("/company/loads");
  const newPickup = new Date(Date.now() + 2 * 24 * 3600 * 1000);
  const load = await prisma.$transaction(async (tx) => {
    const created = await tx.load.create({
      data: {
        companyId: company.id,
        publishedBy: user.id,
        origin: orig.origin,
        destination: orig.destination,
        pickupDate: newPickup,
        pickupWindow: orig.pickupWindow,
        cargoType: orig.cargoType,
        weightKg: orig.weightKg,
        volumeM3: orig.volumeM3,
        requiredVehicle: orig.requiredVehicle,
        priceEur: orig.priceEur,
        priceNegotiable: orig.priceNegotiable,
        notes: orig.notes,
      },
    });
    await createAuditEvent(tx, {
      entityType: "Load",
      entityId: created.id,
      eventType: "LOAD_CREATED",
      actorUserId: user.id,
      metadata: { newStatus: created.status },
    });
    return created;
  });
  revalidatePath("/company/loads");
  redirect(`/company/loads/${load.id}?duplicated=1`);
}

export async function submitRating(_state: LoadState, formData: FormData): Promise<LoadState> {
  const user = await getCurrentUser();
  if (user.role !== "COMPANY") redirect("/login");
  const loadId = formData.get("loadId") as string;
  const score = Number(formData.get("score"));
  const comment = (formData.get("comment") as string) || undefined;
  if (!loadId || !score || score < 1 || score > 5) return { message: "Invalid rating" };
  const company = await prisma.company.findUnique({ where: { userId: user.id } });
  if (!company) return { message: "Company not found" };
  const load = await prisma.load.findUnique({ where: { id: loadId }, include: { applications: true } });
  if (!load || load.companyId !== company.id) return { message: "Load not found" };
  if (load.status !== "COMPLETED") return { message: "Can only rate completed loads" };
  const accepted = await prisma.application.findFirst({ where: { loadId, status: "ACCEPTED" } });
  if (!accepted) return { message: "No carrier to rate" };
  const existing = await prisma.rating.findUnique({ where: { loadId } });
  if (existing) return { message: "Already rated" };
  await prisma.rating.create({
    data: { loadId, companyId: company.id, carrierId: accepted.transporterId, score, comment },
  });
  revalidatePath(`/company/loads/${loadId}`);
  return { message: "Rating saved" };
}

export async function submitPod(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "CARRIER") redirect("/login");
  const loadId = formData.get("loadId") as string;
  const podUrlRaw = (formData.get("podUrl") as string)?.trim();
  const podNoteRaw = (formData.get("podNote") as string)?.trim();
  const podFile = (formData.get("podFile") as File | null) ?? null;
  const podPhoto = (formData.get("podFilePhoto") as File | null) ?? null;
  const podFileChosen = podFile && podFile.size > 0 ? podFile : podPhoto && podPhoto.size > 0 ? podPhoto : null;
  if (!loadId) redirect("/loads");
  let podUrl: string | null = null;
  if (podFileChosen) {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    const isImage = podFileChosen.type.startsWith("image/");
    if (!allowed.includes(podFileChosen.type) && !isImage) redirect(`/loads/${loadId}?pod-error=1`);
    if (podFileChosen.size > 5 * 1024 * 1024) redirect(`/loads/${loadId}?pod-error=1`);
    const bytes = await podFileChosen.arrayBuffer();
    const ext = podFileChosen.type === "application/pdf" ? "pdf" : podFileChosen.type.split("/")[1] || "jpg";
    const name = `${loadId}-${Date.now()}.${ext}`;
    const { writeFile, mkdir } = await import("fs/promises");
    const { join } = await import("path");
    const dir = join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, name), Buffer.from(bytes));
    podUrl = `/uploads/${name}`;
  } else if (podUrlRaw) {
    const parsed = z.string().trim().url("Enter a valid URL (https://...)").max(500).safeParse(podUrlRaw);
    if (!parsed.success) redirect(`/loads/${loadId}?pod-error=1`);
    if (!/^https?:\/\//i.test(podUrlRaw)) redirect(`/loads/${loadId}?pod-error=1`);
    podUrl = podUrlRaw;
  }
  if (podNoteRaw && podNoteRaw.length > 500) redirect(`/loads/${loadId}?pod-error=1`);
  const podNote = podNoteRaw || null;
  const load = await prisma.load.findUnique({ where: { id: loadId } });
  if (!load) redirect("/loads");
  const app = await prisma.application.findUnique({ where: { loadId_transporterId: { loadId, transporterId: user.id } } });
  if (!app || app.status !== "ACCEPTED") redirect(`/loads/${loadId}`);
  if (load.status !== "DELIVERED" && load.status !== "PICKED_UP") redirect(`/loads/${loadId}`);
  await prisma.load.update({ where: { id: loadId }, data: { podUrl, podNote } });
  revalidatePath(`/loads/${loadId}`);
  revalidatePath(`/company/loads/${loadId}`);
  redirect(`/loads/${loadId}?pod=1`);
}

export async function updateLoadStatus(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "COMPANY") redirect("/login");

  const loadId = formData.get("loadId") as string;
  const status = formData.get("status") as string;
  if (!loadId) redirect("/company/loads");

  const allowed = ["CONFIRMED", "COMPLETED"];
  if (!allowed.includes(status)) redirect(`/company/loads/${loadId}`);

  const company = await prisma.company.findUnique({ where: { userId: user.id } });
  if (!company) redirect("/company/loads");

  const load = await prisma.load.findUnique({ where: { id: loadId } });
  if (!load || load.companyId !== company.id) redirect("/company/loads");

  // A booking can only be confirmed once the selected carrier has accepted the offer and load is SELECTED.
  if (status === "CONFIRMED") {
    if (load.status !== "SELECTED") {
      revalidatePath(`/company/loads/${loadId}`);
      redirect(`/company/loads/${loadId}`);
    }
    const accepted = await prisma.application.findFirst({
      where: { loadId, status: "ACCEPTED" },
    });
    if (!accepted) {
      revalidatePath(`/company/loads/${loadId}`);
      redirect(`/company/loads/${loadId}?awaiting-acceptance=1`);
    }
  }

  // Completion requires the carrier to have confirmed delivery and POD.
  if (status === "COMPLETED" && load.status !== "DELIVERED") {
    revalidatePath(`/company/loads/${loadId}`);
    redirect(`/company/loads/${loadId}`);
  }
  if (status === "COMPLETED" && !load.podUrl) {
    revalidatePath(`/company/loads/${loadId}`);
    redirect(`/company/loads/${loadId}?pod-required=1`);
  }

  try {
    await prisma.$transaction(async (tx) => {
      const fresh = await tx.load.findUnique({ where: { id: loadId } });
      if (!fresh || fresh.companyId !== company.id) throw new Error("Invalid load");
      if (status === "CONFIRMED" && fresh.status !== "SELECTED") throw new Error("Invalid transition");
      if (status === "COMPLETED" && fresh.status !== "DELIVERED") throw new Error("Invalid transition");
      if (status === "COMPLETED" && !fresh.podUrl) throw new Error("POD required");
      if (status === "CONFIRMED") {
        const acc = await tx.application.findFirst({ where: { loadId, status: "ACCEPTED" } });
        if (!acc) throw new Error("No acceptance");
      }
      await tx.load.update({ where: { id: loadId }, data: { status: status as "CONFIRMED" | "COMPLETED" } });
      await createAuditEvent(tx, {
        entityType: "Load",
        entityId: loadId,
        eventType: status === "CONFIRMED" ? "BOOKING_CONFIRMED" : "LOAD_COMPLETED",
        actorUserId: user.id,
        metadata: { previousStatus: fresh.status, newStatus: status },
      });
    });
  } catch {
    revalidatePath(`/company/loads/${loadId}`);
    redirect(`/company/loads/${loadId}`);
  }

  const carrier = await prisma.application.findFirst({
    where: { loadId, status: "ACCEPTED" },
    include: { transporter: true },
  });
  if (status === "CONFIRMED" && carrier) {
    await createNotification({
      userId: carrier.transporterId,
      loadId,
      type: "CONFIRMED",
      message: `${company.name} confirmed the booking for ${load.origin} → ${load.destination}. You can now confirm pickup when ready.`,
    }).catch(() => {});
  } else if (status === "COMPLETED" && carrier) {
    await createNotification({
      userId: carrier.transporterId,
      loadId,
      type: "COMPLETED",
      message: `${company.name} marked the load ${load.origin} → ${load.destination} as completed. Thanks for the delivery!`,
    }).catch(() => {});
  }

  revalidatePath(`/company/loads/${loadId}`);
  redirect(`/company/loads/${loadId}`);
}
