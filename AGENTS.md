# ESCOPO ATUAL DO MVP (decidido)

> Esta seção substitui e tem prioridade sobre as seções mais genéricas e especulativas do restante do documento. Não implemente o que está listado como futuro sem uma decisão explícita nova do fundador.

- **Módulo ativo:** apenas **MOVR LOAD** (intermediação de cargas entre Company e Carrier). Os módulos TRACK, FLEET, ROUTE, JOBS e AI mencionados em outras seções são apenas ideias futuras e **NÃO** devem ser implementados sem uma decisão explícita nova.
- **Tipos de usuário ativos:** apenas **Company** e **Carrier** (`role` no schema). Não implementar outros tipos (Armazém, Motorista como entidade separada, etc.) sem decisão explícita.
- **Verificação de empresa:** **manual**, via Prisma Studio, alterando o campo `Company.verified`. Não existe painel de admin e não deve ser criado sem pedido explícito. Não há integração com KVK.
- **Ciclo de vida da carga já implementado e funcional:** `OPEN → SELECTED → CONFIRMED → PICKED_UP → DELIVERED → COMPLETED`, com `Application` passando por `PENDING → SELECTED → ACCEPTED/DECLINED`, e `REJECTED`/`CANCELLED` podendo ser reaplicados.
- **Contato entre as partes** só é revelado depois que a candidatura chega a `SELECTED` ou estado posterior — nunca antes.
- **Banco de dados:** **SQLite via Prisma**, adequado para o piloto atual. Migração para Postgres só deve ser considerada quando houver decisão explícita de hospedagem em produção.

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
