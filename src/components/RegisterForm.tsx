"use client";

import { useActionState } from "react";
import { register, type AuthState } from "@/app/actions/auth";
import { Button, Input, Label, FieldError } from "@/components/ui";
import type { Messages } from "@/lib/i18n";

export function RegisterForm({ role, t }: { role: "CARRIER" | "COMPANY"; t: Messages["auth"] }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(register, undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="role" value={role} />
      <div>
        <Label htmlFor="name">{t.fullName}</Label>
        <Input id="name" name="name" autoComplete="name" placeholder="e.g. Jan van der Berg" />
        <FieldError>{state?.errors?.name?.[0]}</FieldError>
      </div>
      <div>
        <Label htmlFor="email">{t.email}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
        <FieldError>{state?.errors?.email?.[0]}</FieldError>
      </div>
      <div>
        <Label htmlFor="password">{t.password}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
        <FieldError>{state?.errors?.password?.[0]}</FieldError>
      </div>
      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}
      <Button type="submit" disabled={pending} className="w-full py-3">
        {pending ? t.creatingAccount : t.createAccount}
      </Button>
    </form>
  );
}
