import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { MemberRole, Shop } from './types';
export { MODULES, REAL_MODULES, ALLOWED_MODULES } from './modules';

export const hasSupabaseEnv = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const canManage = (role: MemberRole) => role === 'owner' || role === 'manager';

type Membership = { barbershop_id: string; role: MemberRole; barbershops: unknown };

/** Usuário logado + barbearia (primeira associação) para telas do painel. Redireciona quando falta algo. */
export const getPanelContext = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');
  const { data } = await supabase.from('barbershop_members').select('barbershop_id, role, created_at, barbershops(id,name,slug,timezone,opening_hours,onboarding_step)').eq('user_id', user.id).order('created_at').limit(1);
  const membership = (data?.[0] ?? null) as Membership | null;
  const raw = membership ? (Array.isArray(membership.barbershops) ? membership.barbershops[0] : membership.barbershops) as (Shop & { onboarding_step: string }) | null : null;
  if (!membership || !raw) redirect('/painel');
  if (raw.onboarding_step !== 'complete') redirect('/painel');
  const shop: Shop = { id: raw.id, name: raw.name, slug: raw.slug, timezone: raw.timezone || 'America/Sao_Paulo', opening_hours: raw.opening_hours };
  const userName = String(user.user_metadata?.full_name || user.email || 'Usuário');
  return { supabase, user, shop, role: membership.role, userName };
});
export type PanelContext = Awaited<ReturnType<typeof getPanelContext>>;
