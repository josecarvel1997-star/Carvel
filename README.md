# Agenda Certa

Plataforma de gestão para barbearias, salões, trancistas, nail designers e outros profissionais de beleza.

O app usa o schema que já existe no Supabase de produção (projeto `zsittjmnkjtqpgvrhskb`). Todas as leituras passam pelo RLS (membros em `barbershop_members`), as gravações ficam em Server Actions com validação no servidor e as regras de negócio usam as funções RPC do banco. Nada usa a service role.

## O que funciona com dados reais

- **Onboarding** (`/painel`): `bootstrap_barbershop` (versão de 9 argumentos, telefone obrigatório e dias de funcionamento), serviços e `finish_onboarding`.
- **Agenda** (`/painel/agenda`): dia (colunas por profissional) e semana. Novo agendamento via `create_internal_booking` (proprietário, gerente e recepção, com profissional: já abre a comanda) ou `create_admin_appointment` (profissional/barbeiro, serviço sem profissional ou data além de 60 dias). Edição direta em `appointments`, revalidada pelo trigger `enforce_appointment_schedule`.
- **Atendimentos e comandas** (`/painel/atendimentos`): status via `update_appointment_status` (confirmar, iniciar, cancelar, não compareceu) e `advance_appointment` (concluir sem cobrança, reabrir). Comanda (`service_orders` / `service_order_items`): lançar e remover produtos, fechar com forma de pagamento via `close_service_order` (gera venda, lançamentos de caixa, baixa de estoque e comissão).
- **Clientes**: `clients.full_name`, telefone obrigatório (`phone_normalized` único por negócio), consentimento de WhatsApp, histórico.
- **Serviços**: categoria, duração, preço, “exige profissional”; cadastro de salas/recursos (`booking_resources`).
- **Equipe**: funções e comissões de serviço e de produto.
- **Horários**: `barbershops.opening_hours`, a mesma fonte usada pelo trigger e pelas funções públicas.
- **Caixa e financeiro**: abertura/fechamento (`cash_sessions`), suprimento/sangria (`cash_transactions`), lançamentos (`cash_movements`), vendas do mês e taxas por forma de pagamento (`payment_fee_rates`).
- **PDV**: venda de balcão via `register_pdv_sale`.
- **Produtos e estoque**: `products` (quantidade, reservado em comandas, mínimo, disponível para o cliente).
- **Comissões**: `commission_entries` (o profissional vê só as próprias pelo RLS).
- **Central de alertas**: `central_alerts` (resolver, dispensar, reabrir, ativar alertas automáticos).
- **Página pública** (`/b/<slug>`): `public_booking_catalog`, `public_booking_slots` e `create_public_booking` (versão `target_slug`, que também abre a comanda). Depois de agendar, o cliente recebe o link `/b/<slug>/comanda/<token>` (`public_order_details`, `add_public_order_item`, `remove_public_order_item`).

Fila de espera, clientes para retornar, fidelização, relatórios, metas, mensagens/automações de WhatsApp e configurações aparecem com o selo **Em breve**, sem dados fictícios.

## Executar localmente

Requer Node.js 22+ e pnpm.

```sh
pnpm install
cp .env.example .env.local   # preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
pnpm dev
```

A aplicação inicia em `http://localhost:3200`. Use apenas a chave pública (anon) do Supabase.

## Banco de dados

- `202610270001_foundation.sql`: histórico original (perfis, negócios, membros, serviços, equipe).
- `202611080000_live_schema_snapshot.sql`: **fotografia do schema ao vivo, só documentação/baseline. Não aplique em produção.** É idempotente e serve para recriar um banco local equivalente (`supabase db reset`).
- `202611080002_service_order_staff_ops.sql`: **migration aditiva pequena, para aplicar em produção.** Cria `open_service_order`, `add_service_order_item`, `remove_service_order_item` e `refresh_shop_alerts` (só `authenticated`, com checagem de papel). Sem ela, o app funciona, mas abrir comanda para agendamentos sem comanda, lançar ou remover produtos pela equipe e “Verificar agora” na central de alertas mostram um aviso pedindo a migration.

Para aplicar só a migration aditiva pelo painel do Supabase: **SQL Editor**, cole o conteúdo de `202611080002_service_order_staff_ops.sql` e execute (pode rodar mais de uma vez).
