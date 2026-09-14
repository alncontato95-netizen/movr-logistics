"use client";

import { useActionState } from "react";
import { updateCompanyProfile, type ProfileState } from "@/app/actions/profile";
import { Button, Input, Label, FieldError } from "@/components/ui";

export function CompanySettingsForm({
  initial,
}: {
  initial: { name: string; cnpj: string; address: string; phone: string };
}) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateCompanyProfile, undefined);

  return (
    <form action={action} className="space-y-4">
      <Field label="Company name" error={state?.errors?.name?.[0]}>
        <Input name="name" defaultValue={initial.name} placeholder="e.g. Transportadora Brasil Logística Ltda." />
      </Field>
      <Field label="CNPJ" error={state?.errors?.cnpj?.[0]}>
        <Input name="cnpj" defaultValue={initial.cnpj} placeholder="00.000.000/0000-00" />
      </Field>
      <Field label="Address" error={state?.errors?.address?.[0]}>
        <Input name="address" defaultValue={initial.address} placeholder="Street, city" />
      </Field>
      <Field label="Phone" error={state?.errors?.phone?.[0]}>
        <Input name="phone" defaultValue={initial.phone} placeholder="(11) 98765-4321" />
      </Field>
      {state?.message && <p className="text-sm text-brand-dark">{state.message}</p>}
      <Button type="submit" disabled={pending} className="w-full py-3">
        {pending ? "Saving…" : "Save business details"}
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
