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
      <Field label="Nome da empresa" error={state?.errors?.name?.[0]}>
        <Input name="name" defaultValue={initial.name} placeholder="ex.: Transportadora Brasil Logística Ltda." />
      </Field>
      <Field label="CNPJ" error={state?.errors?.cnpj?.[0]}>
        <Input name="cnpj" defaultValue={initial.cnpj} placeholder="00.000.000/0000-00" />
      </Field>
      <Field label="Endereço" error={state?.errors?.address?.[0]}>
        <Input name="address" defaultValue={initial.address} placeholder="Rua, cidade" />
      </Field>
      <Field label="Telefone" error={state?.errors?.phone?.[0]}>
        <Input name="phone" defaultValue={initial.phone} placeholder="(11) 98765-4321" />
      </Field>
      {state?.message && <p className="text-sm text-brand-dark">{state.message}</p>}
      <Button type="submit" disabled={pending} className="w-full py-3">
        {pending ? "Salvando…" : "Salvar dados empresariais"}
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