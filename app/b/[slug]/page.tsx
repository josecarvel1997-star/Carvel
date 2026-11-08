import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/panel/context';
import PublicBooking from './public-booking';
import type { PublicShop } from './types';

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const loadShop = cache(async (slug: string): Promise<PublicShop | null> => {
  if (!SLUG_RE.test(slug) || !hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('public_shop', { p_slug: slug });
  if (error || !data) return null;
  const shop = data as PublicShop;
  return { ...shop, services: shop.services.map((s) => ({ ...s, price: Number(s.price) })) };
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
