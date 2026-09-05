import { z } from "zod";
import { VEHICLE_TYPES, CARGO_TYPES, REGIONS } from "@/lib/constants";

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80, "Name is too long"),
  email: z.string().trim().toLowerCase().email("Please enter a valid email").max(254, "Email is too long"),
  password,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email").max(254, "Email is too long"),
  password: z.string().min(1, "Please enter your password").max(72, "Password is too long"),
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
  name: z.string().trim().min(2, "Please enter your company name").max(120, "Name is too long"),
  kvk: z.string().trim().min(3, "Please enter your KVK number").max(20, "KVK is too long"),
  address: z.string().trim().min(3, "Please enter your address").max(200, "Address is too long"),
  phone: z.string().trim().min(6, "Please enter a phone number").max(30, "Phone is too long"),
});

export const loadSchema = z
  .object({
    origin: z.enum(REGIONS, { message: "Select an origin" }),
    destination: z.enum(REGIONS, { message: "Select a destination" }),
    pickupDate: z
      .string()
      .min(1, "Select a pickup date")
      .refine((v) => !Number.isNaN(Date.parse(v)), { message: "Enter a valid date" })
      .refine(
        (v) => {
          const d = new Date(v);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return d.getTime() >= today.getTime();
        },
        { message: "Pickup date cannot be in the past" },
      ),
    pickupWindow: z.string().trim().max(40).optional(),
    cargoType: z.enum(CARGO_TYPES, { message: "Select a cargo type" }),
    weightKg: z.coerce.number().int().positive("Enter a weight greater than 0").max(50000, "Weight is too high"),
    volumeM3: z.coerce.number().positive("Enter a volume greater than 0").max(200, "Volume is too high").optional(),
    requiredVehicle: z.enum(VEHICLE_TYPES).optional(),
    priceEur: z.coerce.number().int().nonnegative().max(100000, "Price is too high").optional(),
    priceNegotiable: z.boolean().optional().default(true),
    notes: z.string().trim().max(1000).optional(),
  })
  .refine((data) => data.origin !== data.destination, {
    message: "Origin and destination must be different",
    path: ["destination"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CarrierProfileInput = z.infer<typeof carrierProfileSchema>;
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
export type LoadInput = z.infer<typeof loadSchema>;
