// Utilitários das Server Actions (só importado por arquivos 'use server').
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ActionState, MemberRole } from './types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const text = (form: FormData, key: string) => String(form.get(key) ?? '').trim();
export const ok = (message: string): ActionState => ({ ok: true, message, at: Date.now() });
export const fail = (message: string): ActionState => ({ ok: false, message, at: Date.now() });
export const digits = (value: string) => value.replace(/\D/g, '');
export const isUuid = (value: string) => UUID_RE.test(value);
export const checked = (form: FormData, key: string) => form.get(key) === 'on' || form.get(key) === 'true';
/** Aceita “1.234,56”, “1234,56” e “1234.56”. */
export const parseMoney = (value: string) => Number(value.replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
export const NO_ACCESS = 'Você não tem permissão para esta ação.';

/**
 * Toda action confirma a sessão e a associação à barbearia (barbershop_members) no
 * servidor; o RLS e as checagens de papel das funções do banco são a segunda barreira.
 */
export async function actionContext(roles?: MemberRole[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');
  const { data } = await supabase.from('barbershop_members').select('barbershop_id, role, created_at, barbershops(timezone, slug, active_modules)').eq('user_id', user.id).order('created_at').limit(1);
  const membership = data?.[0] as { barbershop_id: string; role: MemberRole; barbershops: unknown } | undefined;
  if (!membership) return null;
  if (roles && !roles.includes(membership.role)) return null;
  const shopRow = (Array.isArray(membership.barbershops) ? membership.barbershops[0] : membership.barbershops) as { timezone?: string; slug?: string; active_modules?: string[] } | null;
  return { supabase, user, shopId: membership.barbershop_id, role: membership.role, timezone: shopRow?.timezone || 'America/Sao_Paulo', slug: shopRow?.slug ?? '', activeModules: shopRow?.active_modules ?? [] };
}

export const done = (message: string) => { revalidatePath('/painel', 'layout'); return ok(message); };

/** Traduz erros do PostgREST/Postgres. Exceções das funções do banco (P0001) já vêm em português. */
export function dbMessage(error: { code?: string; message?: string } | null | undefined, fallback: string) {
  if (!error) return fallback;
  if (error.code === 'P0001' && error.message) return error.message;
  if (error.code === '42501') return NO_ACCESS;
  if (error.code === '23505') return 'Já existe um registro com esses dados.';
  if (error.code === '23514') return 'Algum valor está fora do permitido. Confira os campos.';
  if (error.code === 'PGRST202' || error.code === '42883') return 'Esta ação depende da migration 202611080002_service_order_staff_ops.sql, que ainda não foi aplicada no banco.';
  return fallback;
}
