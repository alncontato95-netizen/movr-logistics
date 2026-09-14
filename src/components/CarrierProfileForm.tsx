"use client";

import { useActionState } from "react";
import { updateCarrierProfile, type ProfileState } from "@/app/actions/profile";
import { Button, Label, Select, FieldError, Input } from "@/components/ui";
import { VEHICLE_LABELS, VEHICLE_TYPES, REGIONS } from "@/lib/constants";

export function CarrierProfileForm({
  initial,
  rntrcLabel,
  rntrcDescription,
  rntrcPlaceholder,
}: {
  initial: {
    vehicleType: string | null;
    vehiclePlate: string | null;
    professionalLicense: string | null;
    licenseUrl: string | null;
    licenseExpiry: string | null;
    carrierVerified: boolean;
    rntrc: string | null;
    phone: string | null;
    currentRegion: string | null;
    acceptsRegions: string[];
    available: boolean;
  };
  rntrcLabel: string;
  rntrcDescription: string;
  rntrcPlaceholder: string;
}) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateCarrierProfile, undefined);

  return (
    <form action={action} className="space-y-5">
      <Field label="Vehicle type" error={state?.errors?.vehicleType?.[0]}>
        <Select name="vehicleType" defaultValue={initial.vehicleType ?? ""}>
          <option value="" disabled>
            Select your vehicle
          </option>
          {VEHICLE_TYPES.map((v) => (
            <option key={v} value={v}>
              {VEHICLE_LABELS[v]}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Vehicle plate" error={state?.errors?.vehiclePlate?.[0]}>
        <Input name="vehiclePlate" defaultValue={initial.vehiclePlate ?? ""} placeholder="e.g. ABC-1D23" />
      </Field>

      <Field label="Professional license" error={state?.errors?.professionalLicense?.[0]}>
        <Input name="professionalLicense" defaultValue={initial.professionalLicense ?? ""} placeholder="e.g. 01234567890" />
      </Field>

      <div className="rounded-xl border border-brand/10 bg-brand-light/30 p-3">
        <p className="text-sm font-semibold text-brand-dark">Habilitação (C/E + Code 95) — for high-value loads</p>
        <p className="text-xs text-muted">Add a link to your license document (Drive, etc.). Manual verification via Studio.</p>
        <div className="mt-3 space-y-3">
          <Field label="License document URL" error={state?.errors?.licenseUrl?.[0]}>
            <Input name="licenseUrl" type="url" defaultValue={initial.licenseUrl ?? ""} placeholder="https://drive.google.com/..." />
          </Field>
          <Field label="License expiry" error={state?.errors?.licenseExpiry?.[0]}>
            <Input name="licenseExpiry" type="date" defaultValue={initial.licenseExpiry ?? ""} />
          </Field>
          {initial.carrierVerified ? (
            <p className="text-xs font-semibold text-success-700">✓ Habilitação verificada</p>
          ) : initial.licenseUrl ? (
            <p className="text-xs text-warning-700">Enviado — aguardando verificação manual.</p>
          ) : (
            <p className="text-xs text-muted">Optional now, required for high-value loads trust badge.</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-brand/10 bg-brand-light/30 p-3">
        <p className="text-sm font-semibold text-brand-dark">{rntrcLabel}</p>
        <p className="text-xs text-muted">{rntrcDescription}</p>
        <div className="mt-3 space-y-1">
          <Input
            name="rntrc"
            inputMode="numeric"
            defaultValue={initial.rntrc ?? ""}
            placeholder={rntrcPlaceholder}
          />
          <FieldError>{state?.errors?.rntrc?.[0]}</FieldError>
        </div>
      </div>

      <Field label="Phone number" error={state?.errors?.phone?.[0]}>
        <Input name="phone" type="tel" defaultValue={initial.phone ?? ""} placeholder="(11) 98765-4321" />
      </Field>

      <Field label="Home region" error={state?.errors?.currentRegion?.[0]}>
        <Select name="currentRegion" defaultValue={initial.currentRegion ?? ""}>
          <option value="" disabled>
            Select your home region
          </option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Regions you serve" error={state?.errors?.acceptsRegions?.[0]}>
        <div className="grid grid-cols-2 gap-2">
          {REGIONS.map((r) => (
            <label
              key={r}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm text-ink hover:border-brand"
            >
              <input
                type="checkbox"
                name="region"
                value={r}
                defaultChecked={initial.acceptsRegions.includes(r)}
                className="h-4 w-4 accent-brand"
              />
              {r}
            </label>
          ))}
        </div>
      </Field>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/10 px-4 py-3 text-sm text-ink">
        <input type="checkbox" name="available" defaultChecked={initial.available} className="h-4 w-4 accent-brand" />
        <span>
          Available for loads now
          <span className="block text-xs text-muted">We&apos;ll include your truck in matching.</span>
        </span>
      </label>

      {state?.message && <p className="text-sm text-brand-dark">{state.message}</p>}
      <Button type="submit" disabled={pending} className="w-full py-3">
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      <FieldError>{error}</FieldError>
    </div>
  );
}
