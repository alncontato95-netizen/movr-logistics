import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <span className="text-6xl">🧭</span>
      <h1 className="mt-4 text-2xl font-bold text-ink">Página não encontrada</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        Não encontramos essa página. Ela pode ter sido movida ou não existir mais.
      </p>
      <div className="mt-6">
        <ButtonLink href="/" variant="secondary">
          Ir para o início
        </ButtonLink>
      </div>
    </div>
  );
}