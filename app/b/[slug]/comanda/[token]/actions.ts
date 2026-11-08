'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const TOKEN_RE = /^[0-9a-f]{64}$/;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAFE = ['Quantidade inválida', 'Comanda não encontrada ou já encerrada', 'Produto indisponível ou sem estoque suficiente', 'Item não encontrado'];

function back(slug: string, token: string, message?: string): never {
  revalidatePath(`/b/${slug}/comanda/${token}`);
  redirect(`/b/${slug}/comanda/${token}${message ? `?erro=${encodeURIComponent(message)}` : ''}`);
}

/** Cliente adiciona um produto à própria comanda (add_public_order_item, autenticado pelo token). */
export async function addMyItem(form: FormData) {
  const slug = String(form.get('slug') ?? ''), token = String(form.get('token') ?? ''), productId = String(form.get('product_id') ?? ''), quantity = Number(form.get('quantity') ?? 1);
  if (!SLUG_RE.test(slug) || !TOKEN_RE.test(token)) redirect('/');
  if (!UUID_RE.test(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) back(slug, token, 'Escolha o produto e a quantidade (1 a 50).');
  const supabase = await createClient();
  const { error } = await supabase.rpc('add_public_order_item', { customer_token: token, target_product: productId, target_quantity: quantity });
  back(slug, token, error ? SAFE.find((m) => error.message?.includes(m)) ?? 'Não foi possível adicionar agora.' : undefined);
}

export async function removeMyItem(form: FormData) {
  const slug = String(form.get('slug') ?? ''), token = String(form.get('token') ?? ''), itemId = String(form.get('item_id') ?? '');
  if (!SLUG_RE.test(slug) || !TOKEN_RE.test(token)) redirect('/');
  if (!UUID_RE.test(itemId)) back(slug, token, 'Item inválido.');
  const supabase = await createClient();
  const { error } = await supabase.rpc('remove_public_order_item', { customer_token: token, target_item: itemId });
  back(slug, token, error ? SAFE.find((m) => error.message?.includes(m)) ?? 'Não foi possível remover agora.' : undefined);
}
