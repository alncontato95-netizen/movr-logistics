"use client";

import { useActionState } from "react";
import { submitRating } from "@/app/actions/loads";
import { Button, Label, Select, Textarea } from "@/components/ui";

export function RatingForm({ loadId }: { loadId: string }) {
  const [state, action, pending] = useActionState(submitRating, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="loadId" value={loadId} />
      <div>
        <Label htmlFor="score">Avaliação (1-5)</Label>
        <Select name="score" defaultValue="">
          <option value="" disabled>Selecionar</option>
          {[1,2,3,4,5].map((s) => (
            <option key={s} value={s}>{s} ★</option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Comentário (opcional)</Label>
        <Textarea name="comment" rows={2} placeholder="Confiável, pontual..." />
      </div>
      {state?.message && <p className="text-sm text-brand-dark">{state.message}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Salvando..." : "Enviar avaliação"}
      </Button>
    </form>
  );
}