export const dynamic = "force-static";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-ink">Política de Privacidade (LGPD)</h1>
      <p className="mt-2 text-sm text-muted">Última atualização: {new Date().toLocaleDateString("pt-BR")} — Piloto SP/RJ/MG</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink">
        <section>
          <h2 className="font-semibold">1. Dados que coletamos</h2>
          <p className="mt-1 text-muted">E-mail, nome, telefone, preferências de veículo e regiões (transportador), CNPJ, endereço e telefone (empresa), cargas e candidaturas criadas por você. Cookies: <code>movr_session</code> (autenticação, 30 dias, httpOnly) e <code>movr_locale</code> (idioma).</p>
        </section>
        <section>
          <h2 className="font-semibold">2. Finalidade</h2>
          <p className="mt-1 text-muted">Corresponder cargas de retorno entre empresas e transportadores no Sudeste do Brasil (SP, RJ, MG), administrar reservas (OPEN → COMPLETED) e permitir contato apenas após a seleção (SELECTED).</p>
        </section>
        <section>
          <h2 className="font-semibold">3. Base legal</h2>
          <p className="mt-1 text-muted">Contrato (correspondência de cargas) e interesse legítimo (operação de piloto). Não há integração com CNPJ nem profiling.</p>
        </section>
        <section>
          <h2 className="font-semibold">4. Retenção e exclusão</h2>
          <p className="mt-1 text-muted">Os dados são mantidos enquanto a conta estiver ativa. Solicite a exclusão por e-mail ao fundador — excluímos Usuário, Empresa e Cargas via Prisma Studio em até 30 dias. O banco é um arquivo SQLite; os backups são manuais.</p>
        </section>
        <section>
          <h2 className="font-semibold">5. Seus direitos (LGPD)</h2>
          <p className="mt-1 text-muted">Acesso, correção, exclusão, portabilidade, informação sobre compartilhamento, bloqueio e eliminação de dados desnecessários. Entre em contato com o fundador. Não há decisões automatizadas.</p>
        </section>
        <section>
          <h2 className="font-semibold">6. Cookies</h2>
          <p className="mt-1 text-muted">Apenas os cookies essenciais mencionados acima. Sem analytics. O banner de consentimento armazena <code>movr_cookie_consent</code> no localStorage.</p>
        </section>
        <section>
          <h2 className="font-semibold">7. Contato</h2>
          <p className="mt-1 text-muted">MOVR Logística — Sudeste do Brasil: São Paulo, Rio de Janeiro, Minas Gerais (piloto). Para solicitações de privacidade, use o e-mail de contato no perfil da sua empresa.</p>
        </section>
      </div>
    </div>
  );
}