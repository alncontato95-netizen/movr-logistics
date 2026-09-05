"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { loadSchema } from "@/lib/validation";
import { createNotification } from "@/lib/notify";
import { isCompatible } from "@/lib/matching";

export type LoadState = { errors?: Record<string, string[] | undefined>; message?: string } | undefined;

export async function createLoad(_state: LoadState, formData: FormData): Promise<LoadState> {
  const user = await getCurrentUser();
  if (user.role !== "COMPANY") redirect("/login");

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
  const load = await prisma.load.create({
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

  await prisma.load.update({ where: { id: loadId }, data: { status: "PICKED_UP" } });

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

  await prisma.load.update({ where: { id: loadId }, data: { status: "DELIVERED" } });

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

  // Completion requires the carrier to have confirmed delivery.
  if (status === "COMPLETED" && load.status !== "DELIVERED") {
    revalidatePath(`/company/loads/${loadId}`);
    redirect(`/company/loads/${loadId}`);
  }

  try {
    await prisma.$transaction(async (tx) => {
      const fresh = await tx.load.findUnique({ where: { id: loadId } });
      if (!fresh || fresh.companyId !== company.id) throw new Error("Invalid load");
      if (status === "CONFIRMED" && fresh.status !== "SELECTED") throw new Error("Invalid transition");
      if (status === "COMPLETED" && fresh.status !== "DELIVERED") throw new Error("Invalid transition");
      if (status === "CONFIRMED") {
        const acc = await tx.application.findFirst({ where: { loadId, status: "ACCEPTED" } });
        if (!acc) throw new Error("No acceptance");
      }
      await tx.load.update({ where: { id: loadId }, data: { status: status as "CONFIRMED" | "COMPLETED" } });
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
