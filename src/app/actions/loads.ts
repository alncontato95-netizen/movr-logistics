"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { loadSchema } from "@/lib/validation";
import { createNotification } from "@/lib/notify";

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

  revalidatePath("/company/loads");
  redirect(`/company/loads/${load.id}`);
}

export async function applyToLoad(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "CARRIER") redirect("/login");

  const loadId = formData.get("loadId") as string;
  const load = await prisma.load.findUnique({ where: { id: loadId } });
  if (!load || load.status !== "OPEN") redirect("/loads");

  const existing = await prisma.application.findUnique({
    where: { loadId_transporterId: { loadId, transporterId: user.id } },
  });
  if (!existing) {
    await prisma.application.create({
      data: { loadId, transporterId: user.id, status: "PENDING" },
    });
    await createNotification({
      userId: load.publishedBy,
      loadId,
      type: "APPLICATION",
      message: `${user.name} expressed interest in your load ${load.origin} → ${load.destination}.`,
    });
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
  const load = await prisma.load.findUnique({ where: { id: loadId } });
  const existing = await prisma.application.findUnique({
    where: { loadId_transporterId: { loadId, transporterId: user.id } },
  });
  if (existing && existing.status === "SELECTED" && load) {
    await prisma.application.update({
      where: { id: existing.id },
      data: { status: "ACCEPTED" },
    });
    await createNotification({
      userId: load.publishedBy,
      loadId,
      type: "ACCEPTED",
      message: `${user.name} accepted your offer for ${load.origin} → ${load.destination}. You can confirm the booking.`,
    });
  }

  revalidatePath(`/loads/${loadId}`);
  revalidatePath("/applications");
  redirect(`/loads/${loadId}?accepted=1`);
}

export async function declineOffer(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "CARRIER") redirect("/login");

  const loadId = formData.get("loadId") as string;
  const load = await prisma.load.findUnique({ where: { id: loadId } });
  const existing = await prisma.application.findUnique({
    where: { loadId_transporterId: { loadId, transporterId: user.id } },
  });
  if (!existing || existing.status !== "SELECTED") redirect(`/loads/${loadId}`);

  await prisma.$transaction([
    prisma.application.update({
      where: { id: existing.id },
      data: { status: "DECLINED" },
    }),
    prisma.application.updateMany({
      where: { loadId, status: "REJECTED" },
      data: { status: "PENDING" },
    }),
    prisma.load.update({
      where: { id: loadId },
      data: { status: "OPEN" },
    }),
  ]);

  if (load) {
    await createNotification({
      userId: load.publishedBy,
      loadId,
      type: "DECLINED",
      message: `${user.name} declined the offer for ${load.origin} → ${load.destination}. The load is open again.`,
    });
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
  });

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
  });

  revalidatePath(`/loads/${loadId}`);
  revalidatePath(`/company/loads/${loadId}`);
  redirect(`/loads/${loadId}?delivered=1`);
}

export async function selectTransporter(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "COMPANY") redirect("/login");

  const loadId = formData.get("loadId") as string;
  const applicationId = formData.get("applicationId") as string;

  const load = await prisma.load.findUnique({ where: { id: loadId } });
  if (!load) redirect("/company/loads");
  const company = await prisma.company.findUnique({ where: { userId: user.id } });
  if (!company || load.companyId !== company.id) redirect("/company/loads");

  const application = await prisma.application.findUnique({
    where: { id: applicationId, loadId },
    include: { transporter: true },
  });
  if (!application) redirect(`/company/loads/${loadId}`);

  await prisma.$transaction([
    prisma.application.updateMany({
      where: { loadId, status: "PENDING" },
      data: { status: "REJECTED" },
    }),
    prisma.application.update({
      where: { id: application.id },
      data: { status: "SELECTED" },
    }),
    prisma.load.update({
      where: { id: loadId },
      data: { status: "SELECTED" },
    }),
  ]);

  await createNotification({
    userId: application.transporterId,
    loadId,
    type: "SELECTED",
    message: `${company.name} selected you for the load ${load.origin} → ${load.destination}. Review the offer and accept or decline it.`,
  });

  revalidatePath(`/company/loads/${loadId}`);
  revalidatePath("/company/loads");
  redirect(`/company/loads/${loadId}?selected=1`);
}

export async function undoSelection(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "COMPANY") redirect("/login");

  const loadId = formData.get("loadId") as string;

  const load = await prisma.load.findUnique({ where: { id: loadId } });
  if (!load) redirect("/company/loads");
  const company = await prisma.company.findUnique({ where: { userId: user.id } });
  if (!company || load.companyId !== company.id) redirect("/company/loads");

  // Only a load that is reserved (carrier selected) but not yet confirmed can be undone.
  if (load.status !== "SELECTED") redirect(`/company/loads/${loadId}`);

  await prisma.$transaction([
    prisma.application.updateMany({
      where: { loadId, status: "SELECTED" },
      data: { status: "PENDING" },
    }),
    prisma.application.updateMany({
      where: { loadId, status: "REJECTED" },
      data: { status: "PENDING" },
    }),
    prisma.load.update({
      where: { id: loadId },
      data: { status: "OPEN" },
    }),
  ]);

  revalidatePath(`/company/loads/${loadId}`);
  revalidatePath("/company/loads");
  redirect(`/company/loads/${loadId}?undone=1`);
}

export async function updateLoadStatus(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "COMPANY") redirect("/login");

  const loadId = formData.get("loadId") as string;
  const status = formData.get("status") as string;

  const allowed = ["CONFIRMED", "COMPLETED"];
  if (!allowed.includes(status)) redirect(`/company/loads/${loadId}`);

  const load = await prisma.load.findUnique({ where: { id: loadId } });
  const company = await prisma.company.findUnique({ where: { userId: user.id } });
  if (!load || !company || load.companyId !== company.id) redirect("/company/loads");

  // A booking can only be confirmed once the selected carrier has accepted the offer.
  if (status === "CONFIRMED") {
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

  await prisma.load.update({ where: { id: loadId }, data: { status: status as "CONFIRMED" | "COMPLETED" } });

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
    });
  } else if (status === "COMPLETED" && carrier) {
    await createNotification({
      userId: carrier.transporterId,
      loadId,
      type: "COMPLETED",
      message: `${company.name} marked the load ${load.origin} → ${load.destination} as completed. Thanks for the delivery!`,
    });
  }

  revalidatePath(`/company/loads/${loadId}`);
  redirect(`/company/loads/${loadId}`);
}
