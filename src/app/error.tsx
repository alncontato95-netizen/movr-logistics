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
      <h1 className="mt-4 text-2xl font-bold text-ink">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        An unexpected error occurred. You can try again or head back to the start.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Try again
        </button>
        <ButtonLink href="/" variant="secondary">
          Go home
        </ButtonLink>
      </div>
    </div>
  );
}
