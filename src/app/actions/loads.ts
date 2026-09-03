"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { loadSchema } from "@/lib/validation";

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

  const allowed = ["CONFIRMED", "IN_TRANSIT", "COMPLETED"];
  if (!allowed.includes(status)) redirect(`/company/loads/${loadId}`);

  const load = await prisma.load.findUnique({ where: { id: loadId } });
  const company = await prisma.company.findUnique({ where: { userId: user.id } });
  if (!load || !company || load.companyId !== company.id) redirect("/company/loads");

  await prisma.load.update({ where: { id: loadId }, data: { status: status as "CONFIRMED" | "IN_TRANSIT" | "COMPLETED" } });

  revalidatePath(`/company/loads/${loadId}`);
  redirect(`/company/loads/${loadId}`);
}
