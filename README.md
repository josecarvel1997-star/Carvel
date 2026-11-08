# Agenda Certa

Plataforma de gestão para barbearias, salões, trancistas, nail designers e outros profissionais de beleza.

## O que já funciona com dados reais

- **Painel** (`/painel`): onboarding, visão geral com números do dia.
- **Agenda** (`/painel/agenda`): visão do dia (colunas por profissional) e da semana, novo agendamento, edição, mudança de status (agendado, confirmado, concluído, não compareceu) e cancelamento. O banco impede dois atendimentos sobrepostos para o mesmo profissional.
- **Atendimentos** (`/painel/atendimentos`): lista do dia com filtro por status.
- **Clientes** (`/painel/clientes`): lista, busca por nome/telefone, cadastro, edição, exclusão (quando não há histórico) e histórico de atendimentos.
- **Serviços**, **Equipe** e **Horários** (`/painel/servicos`, `/painel/equipe`, `/painel/horarios`): CRUD completo; horários gerais da barbearia e, opcionalmente, horário próprio por profissional (com intervalo).
- **Agendamento público** (`/b/<slug>`): sem login, o cliente escolhe serviço, profissional (ou “sem preferência”), dia e horário livre, informa nome e telefone e recebe a confirmação.

Fila de espera, fidelização, financeiro, estoque, relatórios e os demais módulos aparecem com o selo **Em breve** e não exibem dados fictícios.

## Executar localmente

Requer Node.js 22+ e pnpm.

```sh
pnpm install
cp .env.example .env.local   # preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
pnpm dev
```

A aplicação inicia em `http://localhost:3200`. Use apenas a chave pública (anon) do Supabase; nunca coloque a service role key no cliente.

## Banco de dados (Supabase)

As migrations ficam em `supabase/migrations` e devem ser aplicadas **em ordem**:

1. `202610270001_foundation.sql` — perfis, barbearias, membros, serviços, equipe, RLS e funções de onboarding.
2. `202611080001_agenda.sql` — horários de trabalho, clientes, agendamentos e as funções do agendamento público.

### Com a Supabase CLI (recomendado)

```sh
supabase login
supabase link --project-ref <seu-project-ref>
supabase db push            # aplica as migrations pendentes
```

Para testar localmente antes: `supabase start` e depois `supabase db reset` (recria o banco local e aplica todas as migrations).

### Pelo painel do Supabase

Abra **SQL Editor**, cole o conteúdo de cada arquivo (na ordem acima) e execute. Rode cada migration uma única vez.

### O que a migration da agenda cria

- Extensão `btree_gist` (no schema `extensions`) para a restrição de não sobreposição.
- Tabelas `working_hours`, `clients` e `appointments`, com RLS: membros da barbearia leem e escrevem clientes e agendamentos; só proprietário/gerente alteram horários e excluem agendamentos. O papel `anon` não tem acesso às tabelas.
- `public.save_working_hours(target_shop, target_staff, days)` — usada pelo painel para salvar horários de forma atômica.
- Funções públicas (`SECURITY DEFINER`, executáveis por `anon`), chamadas por RPC:
  - `public_shop(p_slug)` — nome, contato, serviços ativos, equipe e horário de funcionamento.
  - `public_available_slots(p_slug, p_service_id, p_staff_id, p_day)` — horários livres em passos de 30 minutos, até 60 dias à frente (`p_staff_id` nulo = qualquer profissional).
  - `public_book(p_slug, p_service_id, p_staff_id, p_starts_at, p_client_name, p_client_phone)` — revalida o horário, cria/reaproveita o cliente pelo telefone e grava o agendamento com `source = 'public'`.

A página pública só aparece para barbearias com o onboarding concluído. Enquanto não houver horários salvos em **Horários**, vale o horário informado no onboarding (`barbershops.opening_hours`).
