import { z } from "zod";
import { VEHICLE_TYPES, CARGO_TYPES, REGIONS } from "@/lib/constants";

const password = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const registerSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  password,
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});

export const carrierProfileSchema = z.object({
  vehicleType: z.enum(VEHICLE_TYPES, { message: "Select your vehicle type" }),
  vehiclePlate: z.string().trim().min(2, "Enter your vehicle plate").optional().or(z.literal("")),
  professionalLicense: z.string().trim().min(3, "Enter your professional license").optional().or(z.literal("")),
  phone: z.string().trim().min(6, "Enter a phone number").optional().or(z.literal("")),
  currentRegion: z.enum(REGIONS, { message: "Select your home region" }),
  acceptsRegions: z.array(z.enum(REGIONS)).min(1, "Select at least one region you serve"),
  available: z.boolean().optional().default(true),
});

export const companyProfileSchema = z.object({
  name: z.string().min(2, "Please enter your company name"),
  kvk: z.string().min(3, "Please enter your KVK number"),
  address: z.string().min(3, "Please enter your address"),
  phone: z.string().min(6, "Please enter a phone number"),
});

export const loadSchema = z.object({
  origin: z.enum(REGIONS, { message: "Select an origin" }),
  destination: z.enum(REGIONS, { message: "Select a destination" }),
  pickupDate: z.string().min(1, "Select a pickup date"),
  pickupWindow: z.string().optional(),
  cargoType: z.enum(CARGO_TYPES, { message: "Select a cargo type" }),
  weightKg: z.coerce.number().int().positive("Enter a weight greater than 0"),
  volumeM3: z.coerce.number().positive("Enter a volume greater than 0").optional(),
  requiredVehicle: z.enum(VEHICLE_TYPES).optional(),
  priceEur: z.coerce.number().int().nonnegative().optional(),
  priceNegotiable: z.boolean().optional().default(true),
  notes: z.string().max(1000).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CarrierProfileInput = z.infer<typeof carrierProfileSchema>;
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
export type LoadInput = z.infer<typeof loadSchema>;
