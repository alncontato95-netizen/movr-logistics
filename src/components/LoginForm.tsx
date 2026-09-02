"use client";

import { useActionState } from "react";
import { login, type AuthState } from "@/app/actions/auth";
import { Button, Input, Label } from "@/components/ui";
import type { Messages } from "@/lib/i18n";

export function LoginForm({ t }: { t: Messages["auth"] }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(login, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="email">{t.email}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
      </div>
      <div>
        <Label htmlFor="password">{t.password}</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" />
      </div>
      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}
      <Button type="submit" disabled={pending} className="w-full py-3">
        {pending ? t.loggingIn : t.loginAction}
      </Button>
    </form>
  );
}
