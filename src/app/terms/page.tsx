export const dynamic = "force-static";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-ink">Termos e Condições de Uso (Piloto)</h1>
      <p className="mt-2 text-sm text-muted">Última atualização: {new Date().toLocaleDateString("pt-BR")} — MOVR LOAD (piloto)</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink">
        <section>
          <h2 className="font-semibold">1. Serviço</h2>
          <p className="mt-1 text-muted">A MOVR LOAD intermedia cargas entre empresas (Embarcadoras) e transportadores. Não há garantia de correspondência. A verificação de empresas é manual, via Prisma Studio; não existe painel administrativo nem integração com CNPJ.</p>
        </section>
        <section>
          <h2 className="font-semibold">2. Reservas</h2>
          <p className="mt-1 text-muted">OPEN → SELECTED → CONFIRMED → PICKED_UP → DELIVERED → COMPLETED. O contato entre as partes só é revelado após a seleção (SELECTED). A empresa pode cancelar somente cargas OPEN ou SELECTED; cargas concluídas exigem comprovante de entrega (POD).</p>
        </section>
        <section>
          <h2 className="font-semibold">3. Responsabilidade</h2>
          <p className="mt-1 text-muted">Banco de dados de piloto (SQLite), sem SLA. Os preços são ofertas; o sinal de &quot;negociável&quot; o indica. O POD é um URL ou arquivo validado (imagem/pdf, 5 MB). Use por sua conta e risco em cargas de alto valor — verifique a habilitação do transportador.</p>
        </section>
        <section>
          <h2 className="font-semibold">4. Conduta</h2>
          <p className="mt-1 text-muted">Proibidos spam e CNPJ fictício (14 dígitos). Aplica-se limite de tentativas por IP/e-mail. O uso indevido leva à revogação manual via Prisma Studio.</p>
        </section>
        <section>
          <h2 className="font-semibold">5. Encerramento</h2>
          <p className="mt-1 text-muted">A conta pode ser excluída mediante solicitação. Cargas em andamento permanecem até serem COMPLETED ou CANCELLED.</p>
        </section>
      </div>
    </div>
  );
}