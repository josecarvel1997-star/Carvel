import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/panel/context';
import PublicBooking from './public-booking';
import type { PublicShop } from './types';

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
type Catalog = { business: { name: string; slug: string; phone: string; address: string; timezone: string; opening_hours: PublicShop['opening_hours'] }; services: { id: string; name: string; duration_minutes: number; price: number }[]; professionals: { id: string; name: string }[] };

/** public_booking_catalog é SECURITY DEFINER e executável pelo anon; devolve só dados públicos. */
const loadShop = cache(async (slug: string): Promise<PublicShop | null> => {
  if (!SLUG_RE.test(slug) || !hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('public_booking_catalog', { target_slug: slug });
  if (error || !data) return null;
  const c = data as Catalog;
  return {
    name: c.business.name, slug: c.business.slug, phone: c.business.phone ?? '', address: c.business.address ?? '', timezone: c.business.timezone || 'America/Sao_Paulo', opening_hours: c.business.opening_hours,
    services: (c.services ?? []).map((s) => ({ ...s, price: Number(s.price), duration_minutes: Number(s.duration_minutes) })),
    staff: (c.professionals ?? []).map((p) => ({ id: p.id, display_name: p.name })),
  };
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const shop = await loadShop((await params).slug);
  return { title: shop ? `Agendar horário · ${shop.name}` : 'Agendamento online · Agenda Certa' };
}

export default async function PublicBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const shop = await loadShop((await params).slug);
  if (!shop) notFound();
  return <PublicBooking shop={shop}/>;
}
