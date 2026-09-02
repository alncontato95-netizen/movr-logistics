"use client";

import { useActionState } from "react";
import { createLoad, type LoadState } from "@/app/actions/loads";
import { Button, Input, Label, Select, Textarea, FieldError } from "@/components/ui";
import { REGIONS, CARGO_TYPES, CARGO_LABELS, VEHICLE_TYPES, VEHICLE_LABELS } from "@/lib/constants";

export function LoadForm() {
  const [state, action, pending] = useActionState<LoadState, FormData>(createLoad, undefined);

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Origin" error={state?.errors?.origin?.[0]}>
          <Select name="origin" defaultValue="">
            <option value="" disabled>
              Select origin
            </option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Destination" error={state?.errors?.destination?.[0]}>
          <Select name="destination" defaultValue="">
            <option value="" disabled>
              Select destination
            </option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Pickup date" error={state?.errors?.pickupDate?.[0]}>
          <Input name="pickupDate" type="date" />
        </Field>
        <Field label="Pickup window (optional)" error={state?.errors?.pickupWindow?.[0]}>
          <Input name="pickupWindow" placeholder="e.g. 08:00 – 12:00" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Cargo type" error={state?.errors?.cargoType?.[0]}>
          <Select name="cargoType" defaultValue="">
            <option value="" disabled>
              Select
            </option>
            {CARGO_TYPES.map((c) => (
              <option key={c} value={c}>
                {CARGO_LABELS[c]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Weight (kg)" error={state?.errors?.weightKg?.[0]}>
          <Input name="weightKg" type="number" min="1" placeholder="e.g. 1200" />
        </Field>
        <Field label="Volume (m³) (optional)" error={state?.errors?.volumeM3?.[0]}>
          <Input name="volumeM3" type="number" min="0" step="0.1" placeholder="e.g. 12" />
        </Field>
      </div>

      <Field label="Required vehicle (optional)" error={state?.errors?.requiredVehicle?.[0]}>
        <Select name="requiredVehicle" defaultValue="">
          <option value="">Any vehicle</option>
          {VEHICLE_TYPES.map((v) => (
            <option key={v} value={v}>
              {VEHICLE_LABELS[v]}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Offered price (€) (optional)" error={state?.errors?.priceEur?.[0]}>
          <Input name="priceEur" type="number" min="0" placeholder="e.g. 350" />
        </Field>
        <div className="flex items-end pb-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/10 px-4 py-3 text-sm text-ink">
            <input type="checkbox" name="priceNegotiable" defaultChecked className="h-4 w-4 accent-brand" />
            Price is negotiable
          </label>
        </div>
      </div>

      <Field label="Notes (optional)" error={state?.errors?.notes?.[0]}>
        <Textarea name="notes" rows={3} placeholder="Anything carriers should know…" />
      </Field>

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}
      <Button type="submit" disabled={pending} className="w-full py-3">
        {pending ? "Publishing…" : "Publish load"}
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
