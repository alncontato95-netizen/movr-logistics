"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { carrierProfileSchema, companyProfileSchema } from "@/lib/validation";

export type ProfileState = { errors?: Record<string, string[] | undefined>; message?: string } | undefined;

export async function updateCarrierProfile(_state: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (user.role !== "CARRIER") redirect("/login");

  const selectedRegions = formData.getAll("region").filter((v) => v !== "on");

  const parsed = carrierProfileSchema.safeParse({
    vehicleType: formData.get("vehicleType"),
    vehiclePlate: formData.get("vehiclePlate"),
    professionalLicense: formData.get("professionalLicense"),
    phone: formData.get("phone"),
    currentRegion: formData.get("currentRegion"),
    acceptsRegions: selectedRegions,
    available: formData.get("available") === "on",
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  await prisma.user.update({
    where: { id: user.id },
    data: {
      vehicleType: data.vehicleType,
      vehiclePlate: data.vehiclePlate || null,
      professionalLicense: data.professionalLicense || null,
      phone: data.phone || null,
      currentRegion: data.currentRegion,
      acceptsRegions: JSON.stringify(data.acceptsRegions),
      available: data.available,
    },
  });

  revalidatePath("/profile");
  return { message: "Profile updated." };
}

export async function updateCompanyProfile(_state: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (user.role !== "COMPANY") redirect("/login");

  const parsed = companyProfileSchema.safeParse({
    name: formData.get("name"),
    kvk: formData.get("kvk"),
    address: formData.get("address"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const company = await findCompany(user.id);

  if (company) {
    await prisma.company.update({ where: { id: company.id }, data });
  } else {
    await prisma.company.create({
      data: { userId: user.id, name: data.name, kvk: data.kvk, address: data.address, phone: data.phone },
    });
  }

  revalidatePath("/company/settings");
  return { message: "Business details saved." };
}

async function findCompany(userId: string) {
  return prisma.company.findUnique({ where: { userId } });
}
