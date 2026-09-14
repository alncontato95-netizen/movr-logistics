"use client";

import { useActionState } from "react";
import { createLoad, updateLoad, type LoadState } from "@/app/actions/loads";
import { Button, Input, Label, Select, Textarea, FieldError } from "@/components/ui";
import { REGIONS, CARGO_TYPES, CARGO_LABELS, VEHICLE_TYPES, VEHICLE_LABELS } from "@/lib/constants";
import type { Load } from "@/generated/prisma/client";

type LoadFormLoad = Pick<Load, "id" | "origin" | "destination" | "pickupDate" | "pickupWindow" | "cargoType" | "weightKg" | "volumeM3" | "requiredVehicle" | "priceEur" | "priceNegotiable" | "notes">;

export function LoadForm({ load, action: actionProp }: { load?: LoadFormLoad; action?: (state: LoadState, formData: FormData) => Promise<LoadState> }) {
  const actionToUse = actionProp ?? (load ? updateLoad : createLoad);
  const [state, action, pending] = useActionState<LoadState, FormData>(actionToUse, undefined);
  const pickupDateValue = load ? new Date(load.pickupDate).toISOString().slice(0, 10) : undefined;

  return (
    <form action={action} className="space-y-5">
      {load && <input type="hidden" name="loadId" value={load.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Origem" error={state?.errors?.origin?.[0]}>
          <Select name="origin" defaultValue={load?.origin ?? ""}>
            <option value="" disabled>
              Selecione a origem
            </option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Destino" error={state?.errors?.destination?.[0]}>
          <Select name="destination" defaultValue={load?.destination ?? ""}>
            <option value="" disabled>
              Selecione o destino
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
        <Field label="Data de coleta" error={state?.errors?.pickupDate?.[0]}>
          <Input name="pickupDate" type="date" defaultValue={pickupDateValue} />
        </Field>
        <Field label="Janela de coleta (opcional)" error={state?.errors?.pickupWindow?.[0]}>
          <Input name="pickupWindow" defaultValue={load?.pickupWindow ?? ""} placeholder="ex.: 08:00 – 12:00" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Tipo de carga" error={state?.errors?.cargoType?.[0]}>
          <Select name="cargoType" defaultValue={load?.cargoType ?? ""}>
            <option value="" disabled>
              Selecionar
            </option>
            {CARGO_TYPES.map((c) => (
              <option key={c} value={c}>
                {CARGO_LABELS[c]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Peso (kg)" error={state?.errors?.weightKg?.[0]}>
          <Input name="weightKg" type="number" min="1" placeholder="ex.: 1200" defaultValue={load?.weightKg ?? ""} />
        </Field>
        <Field label="Volume (m³) (opcional)" error={state?.errors?.volumeM3?.[0]}>
          <Input name="volumeM3" type="number" min="0" step="0.1" placeholder="ex.: 12" defaultValue={load?.volumeM3 ?? ""} />
        </Field>
      </div>

      <Field label="Veículo necessário (opcional)" error={state?.errors?.requiredVehicle?.[0]}>
        <Select name="requiredVehicle" defaultValue={load?.requiredVehicle ?? ""}>
          <option value="">Qualquer veículo</option>
          {VEHICLE_TYPES.map((v) => (
            <option key={v} value={v}>
              {VEHICLE_LABELS[v]}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Preço ofertado (R$) (opcional)" error={state?.errors?.priceEur?.[0]}>
          <Input name="priceEur" type="number" min="0" placeholder="ex.: 3500" defaultValue={load?.priceEur ?? ""} />
        </Field>
        <div className="flex items-end pb-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/10 px-4 py-3 text-sm text-ink">
            <input type="checkbox" name="priceNegotiable" defaultChecked={load ? load.priceNegotiable : true} className="h-4 w-4 accent-brand" />
            O preço é negociável
          </label>
        </div>
      </div>

      <Field label="Observações (opcional)" error={state?.errors?.notes?.[0]}>
        <Textarea name="notes" rows={3} placeholder="Algo que os transportadores devam saber…" defaultValue={load?.notes ?? ""} />
      </Field>

      {state?.message && <p className="text-sm text-error">{state.message}</p>}
      <Button type="submit" disabled={pending} className="w-full py-3">
        {pending ? (load ? "Salvando…" : "Publicando…") : load ? "Salvar alterações" : "Publicar carga"}
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