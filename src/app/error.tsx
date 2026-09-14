"use client";

import { useEffect } from "react";
import { ButtonLink } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <span className="text-6xl">😕</span>
      <h1 className="mt-4 text-2xl font-bold text-ink">Algo deu errado</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        Ocorreu um erro inesperado. Você pode tentar novamente ou voltar ao início.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Tentar novamente
        </button>
        <ButtonLink href="/" variant="secondary">
          Ir para o início
        </ButtonLink>
      </div>
    </div>
  );
}