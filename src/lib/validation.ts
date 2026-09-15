import { z } from "zod";
import { VEHICLE_TYPES, CARGO_TYPES, REGIONS } from "@/lib/constants";

const password = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .max(72, "A senha deve ter no máximo 72 caracteres");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Digite seu nome").max(80, "Nome muito longo"),
  email: z.string().trim().toLowerCase().email("Digite um e-mail válido").max(254, "E-mail muito longo"),
  password,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Digite um e-mail válido").max(254, "E-mail muito longo"),
  password: z.string().min(1, "Digite sua senha").max(72, "Senha muito longa"),
});

export const cnpj = z
  .string()
  .trim()
  .regex(/^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})$/, {
    message: "Digite um CNPJ válido (00.000.000/0000-00 ou 14 dígitos)",
  });

export const carrierProfileSchema = z.object({
  vehicleType: z.enum(VEHICLE_TYPES, { message: "Selecione o tipo do seu veículo" }),
  vehiclePlate: z.string().trim().min(2, "Digite a placa do seu veículo").optional().or(z.literal("")),
  professionalLicense: z.string().trim().min(3, "Digite sua licença profissional").optional().or(z.literal("")),
  licenseUrl: z.string().trim().url("Digite uma URL válida").max(500, "URL muito longa").optional().or(z.literal("")),
  licenseExpiry: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), { message: "Digite uma data válida" })
    .refine((v) => !v || new Date(v).getTime() > Date.now(), { message: "A validade deve ser no futuro" }),
  phone: z.string().trim().min(6, "Digite um número de telefone").optional().or(z.literal("")),
  rntrc: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^\d{1,14}$/.test(v), {
      message: "O RNTRC deve conter apenas números (até 14 dígitos)",
    }),
  cnpj: cnpj.optional().or(z.literal("")),
  currentRegion: z.enum(REGIONS, { message: "Selecione sua região de origem" }),
  acceptsRegions: z.array(z.enum(REGIONS)).min(1, "Selecione pelo menos uma região que você atende"),
  available: z.boolean().optional().default(true),
});

export const companyProfileSchema = z.object({
  name: z.string().trim().min(2, "Digite o nome da sua empresa").max(120, "Nome muito longo"),
  cnpj,
  address: z.string().trim().min(3, "Digite seu endereço").max(200, "Endereço muito longo"),
  phone: z.string().trim().min(6, "Digite um número de telefone").max(30, "Telefone muito longo"),
});

export const loadSchema = z
  .object({
    origin: z.enum(REGIONS, { message: "Selecione uma origem" }),
    destination: z.enum(REGIONS, { message: "Selecione um destino" }),
    pickupDate: z
      .string()
      .min(1, "Selecione uma data de coleta")
      .refine((v) => !Number.isNaN(Date.parse(v)), { message: "Digite uma data válida" })
      .refine(
        (v) => {
          const d = new Date(v);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return d.getTime() >= today.getTime();
        },
        { message: "A data de coleta não pode estar no passado" },
      ),
    pickupWindow: z.string().trim().max(40).optional(),
    cargoType: z.enum(CARGO_TYPES, { message: "Selecione o tipo de carga" }),
    weightKg: z.coerce.number().int().positive("Digite um peso maior que 0").max(50000, "Peso muito alto"),
    volumeM3: z.coerce.number().positive("Digite um volume maior que 0").max(200, "Volume muito alto").optional(),
    requiredVehicle: z.enum(VEHICLE_TYPES).optional(),
    priceEur: z.coerce.number().int().nonnegative().max(100000, "Preço muito alto").optional(),
    priceNegotiable: z.boolean().optional().default(true),
    notes: z.string().trim().max(1000).optional(),
  })
  .refine((data) => data.origin !== data.destination, {
    message: "Origem e destino devem ser diferentes",
    path: ["destination"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CarrierProfileInput = z.infer<typeof carrierProfileSchema>;
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
export type LoadInput = z.infer<typeof loadSchema>;