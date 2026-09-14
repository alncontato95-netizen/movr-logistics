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
    licenseUrl: formData.get("licenseUrl"),
    licenseExpiry: formData.get("licenseExpiry"),
    phone: formData.get("phone"),
    rntrc: formData.get("rntrc"),
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
      licenseUrl: data.licenseUrl || null,
      licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry as string) : null,
      phone: data.phone || null,
      rntrc: data.rntrc || null,
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
    cnpj: formData.get("cnpj"),
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
      data: { userId: user.id, name: data.name, cnpj: data.cnpj, address: data.address, phone: data.phone },
    });
  }

  revalidatePath("/company/settings");
  return { message: "Business details saved." };
}

async function findCompany(userId: string) {
  return prisma.company.findUnique({ where: { userId } });
}
